import {
  collection,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

/**
 * Creates a SITE_INVITE notification for a single user.
 *
 * @param {string} userId - Recipient's Firebase Auth UID
 * @param {object} payload
 * @param {string} payload.siteId
 * @param {string} payload.siteName
 * @param {string} payload.invitedBy    - Inviter's Auth UID
 * @param {string} payload.inviterName
 * @param {string} payload.membershipId - Corresponding site_members doc ID
 * @param {string} [payload.type]       - Defaults to "SITE_INVITE"
 */
export async function createNotification(userId, payload) {
  const notifRef = doc(collection(firebase_fs, "notifications"));
  await setDoc(notifRef, {
    userId,
    type: payload.type ?? "SITE_INVITE",
    siteId: payload.siteId,
    siteName: payload.siteName,
    invitedBy: payload.invitedBy,
    inviterName: payload.inviterName,
    membershipId: payload.membershipId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Creates a CHECK_IN_ALERT notification for the site's project manager.
 *
 * @param {string} pmUserId          - PM's Firebase Auth UID
 * @param {object} payload
 * @param {string} payload.siteId
 * @param {string} payload.siteName
 * @param {string} payload.reporterUserId  - UID of person who answered "not on track"
 * @param {string} payload.reporterEmail   - Display email for the card
 * @param {string} payload.localDate       - YYYY-MM-DD
 * @returns {Promise<string>}  the new notification document ID
 */
export async function createCheckInAlertNotification(pmUserId, payload) {
  const notifRef = doc(collection(firebase_fs, "notifications"));
  await setDoc(notifRef, {
    userId: pmUserId,
    type: "CHECK_IN_ALERT",
    siteId: payload.siteId,
    siteName: payload.siteName,
    reporterUserId: payload.reporterUserId,
    reporterEmail: payload.reporterEmail ?? "",
    localDate: payload.localDate,
    issueId: null,
    read: false,
    createdAt: serverTimestamp(),
  });
  return notifRef.id;
}

/**
 * Links an issue to an existing CHECK_IN_ALERT notification.
 * Called after the user creates an issue from the not-on-track flow.
 *
 * @param {string} notificationId
 * @param {string} issueId
 */
export async function linkIssueToCheckInAlert(notificationId, issueId) {
  if (!notificationId || !issueId) return;
  await updateDoc(doc(firebase_fs, "notifications", notificationId), {
    issueId,
  });
}

/**
 * Creates an ISSUE_CREATED notification for the site's project manager.
 * Called when any user (foreman, sub) creates a new issue.
 */
export async function createIssueCreatedNotification(pmUserId, payload) {
  const notifRef = doc(collection(firebase_fs, "notifications"));
  await setDoc(notifRef, {
    userId: pmUserId,
    type: "ISSUE_CREATED",
    siteId: payload.siteId,
    siteName: payload.siteName,
    issueId: payload.issueId,
    issueTitle: payload.issueTitle,
    reporterEmail: payload.reporterEmail ?? "",
    read: false,
    createdAt: serverTimestamp(),
  });
  return notifRef.id;
}

/**
 * Fan-out: creates notifications for multiple users in one batch.
 * Originally a no-op stub — now fully implemented.
 *
 * @param {string} siteId
 * @param {object} payload
 * @param {string[]} userIds - Array of recipient UIDs
 */
export async function createNotificationForSiteUsers(siteId, payload, userIds = []) {
  if (userIds.length === 0) return;

  const batch = writeBatch(firebase_fs);
  userIds.forEach((uid) => {
    const notifRef = doc(collection(firebase_fs, "notifications"));
    batch.set(notifRef, {
      userId: uid,
      type: payload.type ?? "SITE_INVITE",
      siteId,
      siteName: payload.siteName ?? "",
      invitedBy: payload.invitedBy ?? "",
      inviterName: payload.inviterName ?? "",
      membershipId: payload.membershipId ?? "",
      read: false,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
}
