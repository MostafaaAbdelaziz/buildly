/**
 * Bob App — Firebase Cloud Functions
 *
 * Functions:
 *  1. sendCheckInReminders  — Pub/Sub (every minute via Cloud Scheduler)
 *     Checks each site's checkInTime + workDays. When the current UTC minute
 *     matches a site's configured reminder time, sends push notifications to
 *     all active members of that site via Expo Push API.
 *
 *  2. notifyPMOnNotOnTrack  — Firestore trigger on daily_check_ins create/update
 *     When a check-in document is written with status "not_on_track", sends a
 *     push notification to the site's project manager if they have a push token.
 *
 * Push delivery:
 *  The app uses expo-notifications which issues Expo Push Tokens ("ExponentPushToken[...]").
 *  We send to Expo's Push API which fans out to FCM (Android) and APNs (iOS).
 *  No separate FCM/APNs credentials are needed — Expo handles the last mile.
 *
 * Timezone handling:
 *  Sites store checkInTime as "HH:MM" in local time and a timezone string
 *  (IANA, e.g. "America/Toronto"). If timezone is absent, UTC is assumed.
 *  The scheduler runs every minute; we compare the site's local HH:MM to now.
 */

const { onMessagePublished } = require("firebase-functions/v2/pubsub");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const https = require("https");

admin.initializeApp();
const db = admin.firestore();

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const DEFAULT_CHECK_IN_TIME = "14:00";
const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri (0=Sun)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns current HH:MM in a given IANA timezone (falls back to UTC).
 * @param {string} [timezone]
 * @returns {{ hhmm: string, dayOfWeek: number }}
 */
function getNowInTimezone(timezone) {
  const tz = timezone || "UTC";
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      weekday: "short",
    }).formatToParts(now);

    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Mon";

    const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dayOfWeek = WEEKDAYS[weekdayStr] ?? new Date().getDay();

    return { hhmm: `${hour}:${minute}`, dayOfWeek };
  } catch {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    return { hhmm: `${h}:${m}`, dayOfWeek: now.getUTCDay() };
  }
}

/**
 * Sends a batch of messages to the Expo Push API.
 * @param {Array<{ to: string, title: string, body: string, data?: object }>} messages
 */
async function sendExpoPushBatch(messages) {
  if (!messages.length) return;

  const body = JSON.stringify(messages);

  return new Promise((resolve, reject) => {
    const req = https.request(
      EXPO_PUSH_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate",
          Accept: "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            // Log any delivery errors from Expo
            (parsed.data || []).forEach((ticket, i) => {
              if (ticket.status === "error") {
                logger.warn(`Expo push ticket error for message ${i}:`, ticket.message, ticket.details);
              }
            });
          } catch {
            // Non-JSON response — not fatal
          }
          resolve();
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Fetches the Expo push token for a user from Firestore users/{uid}.
 * @param {string} uid
 * @returns {Promise<string|null>}
 */
async function getPushToken(uid) {
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? (snap.data().pushToken ?? null) : null;
}

// ─── Function 1: sendCheckInReminders ─────────────────────────────────────────

/**
 * Triggered by Cloud Scheduler every minute via Pub/Sub.
 * Finds sites whose check-in time matches the current local minute
 * and sends push reminders to all active members.
 */
exports.sendCheckInReminders = onMessagePublished(
  { topic: "bob-checkin-nudge", region: "us-central1" },
  async () => {
    logger.info("sendCheckInReminders: checking sites");

    // Load all active (non-deleted) sites
    const sitesSnap = await db
      .collection("sites")
      .where("deleted", "!=", true)
      .get();

    if (sitesSnap.empty) {
      logger.info("No active sites found.");
      return;
    }

    const messages = [];

    await Promise.all(
      sitesSnap.docs.map(async (siteDoc) => {
        const site = siteDoc.data();
        const siteId = siteDoc.id;

        const checkInTime = site.checkInTime || DEFAULT_CHECK_IN_TIME;
        const workDays = site.workDays || DEFAULT_WORK_DAYS;
        const timezone = site.timezone || "UTC";

        const { hhmm, dayOfWeek } = getNowInTimezone(timezone);

        // Only send if current time matches and today is a workday
        if (hhmm !== checkInTime) return;
        if (!workDays.includes(dayOfWeek)) return;

        logger.info(`Sending reminders for site ${siteId} (${site.name})`);

        // Collect all user IDs: PM + active members
        const userIds = new Set();
        if (site.projectManagerId) userIds.add(site.projectManagerId);

        const membersSnap = await db
          .collection("site_members")
          .where("siteId", "==", siteId)
          .where("status", "==", "ACTIVE")
          .get();

        membersSnap.docs.forEach((m) => {
          if (m.data().userId) userIds.add(m.data().userId);
        });

        // Fetch push tokens and build messages
        await Promise.all(
          [...userIds].map(async (uid) => {
            const token = await getPushToken(uid);
            if (!token || !token.startsWith("ExponentPushToken")) return;

            messages.push({
              to: token,
              sound: "default",
              title: "2PM Check-in",
              body: `Time to check in for ${site.name || "your site"}.`,
              data: { siteId, siteName: site.name || "" },
            });
          })
        );
      })
    );

    if (messages.length === 0) {
      logger.info("No push tokens matched this minute.");
      return;
    }

    logger.info(`Sending ${messages.length} push notification(s)`);

    // Expo recommends batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      await sendExpoPushBatch(messages.slice(i, i + BATCH_SIZE));
    }

    logger.info("sendCheckInReminders: done");
  }
);

// ─── Function 2: notifyPMOnNotOnTrack ─────────────────────────────────────────

/**
 * Firestore trigger: fires when a daily_check_ins document is created or updated.
 * If the status is "not_on_track", sends a push notification to the site PM.
 */
exports.notifyPMOnNotOnTrack = onDocumentWritten(
  { document: "daily_check_ins/{checkInId}", region: "us-central1" },
  async (event) => {
    const after = event.data?.after;
    if (!after || !after.exists) return;

    const checkIn = after.data();

    // Only act on "not_on_track" submissions
    if (checkIn.status !== "not_on_track") return;

    // Avoid duplicate pushes: only fire on create, or if status changed to not_on_track
    const before = event.data?.before;
    const prevStatus = before?.exists ? before.data()?.status : null;
    if (prevStatus === "not_on_track") return; // already notified

    const { siteId, userId: reporterUid, localDate } = checkIn;
    if (!siteId) return;

    // Get site to find the PM
    const siteSnap = await db.collection("sites").doc(siteId).get();
    if (!siteSnap.exists) return;

    const site = siteSnap.data();
    const pmUid = site.projectManagerId;
    if (!pmUid || pmUid === reporterUid) return; // don't notify PM about their own submission

    const pmToken = await getPushToken(pmUid);
    if (!pmToken || !pmToken.startsWith("ExponentPushToken")) return;

    // Get reporter display name
    let reporterLabel = reporterUid;
    try {
      const reporterDoc = await db.collection("users").doc(reporterUid).get();
      if (reporterDoc.exists) {
        reporterLabel = reporterDoc.data().email || reporterUid;
      }
    } catch {
      // Non-fatal; use uid as fallback
    }

    await sendExpoPushBatch([
      {
        to: pmToken,
        sound: "default",
        title: "Site not on track",
        body: `${reporterLabel} reported ${site.name || "a site"} is not on track${localDate ? ` (${localDate})` : ""}.`,
        data: { siteId, type: "CHECK_IN_ALERT" },
      },
    ]);

    logger.info(`Notified PM ${pmUid} about not_on_track from ${reporterUid} on site ${siteId}`);
  }
);
