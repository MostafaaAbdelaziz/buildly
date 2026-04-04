import { useEffect } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

const NOTIFICATION_TAG_PREFIX = "checkin-reminder-";

/**
 * Schedules a daily local notification for each active site the user belongs to.
 * Fires at the site's configured checkInTime on the configured workDays.
 * Re-schedules automatically when site settings change (Firestore listener).
 *
 * Works in Expo Go on iOS (local notifications are not affected by SDK 53 restriction).
 *
 * @param {string|null} uid - Firebase Auth UID
 */
export function useCheckInReminder(uid) {
  useEffect(() => {
    if (!uid) return;

    async function ensurePermission() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") return false;
      }
      return true;
    }

    async function scheduleForSite(site) {
      if (!site?.id || !site?.checkInTime) return;

      const tag = `${NOTIFICATION_TAG_PREFIX}${site.id}`;

      // Cancel any existing notification for this site before rescheduling
      await cancelForSite(site.id);

      const [hour, minute] = site.checkInTime.split(":").map(Number);
      const workDays = site.workDays ?? [1, 2, 3, 4, 5]; // default Mon–Fri

      // Schedule one notification per workday
      await Promise.all(
        workDays.map((weekday) =>
          Notifications.scheduleNotificationAsync({
            identifier: `${tag}-day${weekday}`,
            content: {
              title: "2PM Check-in",
              body: `Time to check in for ${site.name ?? "your site"}.`,
              data: { siteId: site.id, siteName: site.name ?? "" },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: weekday === 0 ? 1 : weekday + 1, // iOS uses 1=Sun … 7=Sat; JS uses 0=Sun
              hour,
              minute,
              repeats: true,
            },
          })
        )
      );
    }

    async function cancelForSite(siteId) {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const tag = `${NOTIFICATION_TAG_PREFIX}${siteId}`;
      await Promise.all(
        scheduled
          .filter((n) => n.identifier.startsWith(tag))
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
    }

    async function init() {
      const ok = await ensurePermission();
      if (!ok) return;

      // Listen to sites where user is PM
      const managerQ = query(
        collection(firebase_fs, "sites"),
        where("projectManagerId", "==", uid)
      );

      // Listen to sites where user is an active member
      const memberQ = query(
        collection(firebase_fs, "site_members"),
        where("userId", "==", uid),
        where("status", "==", "ACTIVE")
      );

      const trackedSiteIds = new Set();

      const unsubManager = onSnapshot(managerQ, async (snap) => {
        for (const d of snap.docs) {
          const site = { id: d.id, ...d.data() };
          if (!site.deleted) {
            trackedSiteIds.add(site.id);
            await scheduleForSite(site);
          }
        }
      });

      const unsubMember = onSnapshot(memberQ, async (snap) => {
        for (const d of snap.docs) {
          const siteId = d.data().siteId;
          if (!siteId || trackedSiteIds.has(siteId)) continue;
          try {
            const siteSnap = await getDoc(doc(firebase_fs, "sites", siteId));
            if (siteSnap.exists()) {
              const site = { id: siteSnap.id, ...siteSnap.data() };
              if (!site.deleted) {
                trackedSiteIds.add(site.id);
                await scheduleForSite(site);
              }
            }
          } catch (e) {
            console.warn("useCheckInReminder: failed to load site", siteId, e?.message);
          }
        }
      });

      return () => {
        unsubManager();
        unsubMember();
      };
    }

    let cleanup;
    init()
      .then((fn) => { cleanup = fn; })
      .catch((e) => console.warn("useCheckInReminder init error:", e?.message));

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [uid]);
}
