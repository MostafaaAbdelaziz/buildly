import {
  collection,
  doc,
  writeBatch,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as dbRef,
  get as dbGet,
} from "firebase/database";
import { firebase_fs, firebase_db } from "../firebaseConfig/firebaseConfig";

/**
 * Look up a user UID from RTDB by email.
 * RTDB structure: users/{uid}/email
 * Returns the uid string, or null if not found.
 */
export async function findUserByEmail(email) {
  const snapshot = await dbGet(dbRef(firebase_db, "users"));
  if (!snapshot.exists()) return null;

  let foundUid = null;
  snapshot.forEach((child) => {
    if (child.val().email === email) {
      foundUid = child.key;
    }
  });
  return foundUid;
}

/**
 * Invite a user to a site. Atomically creates:
 *   - site_members/{newId}  with status PENDING
 *   - notifications/{newId} with type SITE_INVITE
 *
 * @param {object} params
 * @param {string} params.siteId
 * @param {string} params.siteName
 * @param {string} params.targetUserId  - Firebase Auth UID of the invitee
 * @param {string} params.role          - "WORKER" | "FOREMAN" | "MANAGER"
 * @param {string} params.inviterUid    - Auth UID of the manager sending invite
 * @param {string} params.inviterName   - Display name / email of the manager
 * @returns {Promise<string>} the new membership document ID
 */
export async function inviteUserToSite({
  siteId,
  siteName,
  targetUserId,
  role,
  inviterUid,
  inviterName,
}) {
  const batch = writeBatch(firebase_fs);

  const memberRef = doc(collection(firebase_fs, "site_members"));
  batch.set(memberRef, {
    siteId,
    siteName,
    userId: targetUserId,
    role,
    invitedBy: inviterUid,
    inviterName,
    status: "PENDING",
    addedAt: serverTimestamp(),
    resolvedAt: null,
  });

  const notifRef = doc(collection(firebase_fs, "notifications"));
  batch.set(notifRef, {
    userId: targetUserId,
    type: "SITE_INVITE",
    siteId,
    siteName,
    invitedBy: inviterUid,
    inviterName,
    membershipId: memberRef.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return memberRef.id;
}

/**
 * Accept a site invitation.
 * Updates site_members → ACTIVE and marks the notification read.
 */
export async function acceptInvite(membershipId, notificationId) {
  const memberRef = doc(firebase_fs, "site_members", membershipId);
  await updateDoc(memberRef, {
    status: "ACTIVE",
    resolvedAt: serverTimestamp(),
  });

  if (notificationId) {
    await updateDoc(doc(firebase_fs, "notifications", notificationId), {
      read: true,
    });
  }
}

/**
 * Reject a site invitation.
 * Updates site_members → REJECTED and marks the notification read.
 */
export async function rejectInvite(membershipId, notificationId) {
  const memberRef = doc(firebase_fs, "site_members", membershipId);
  await updateDoc(memberRef, {
    status: "REJECTED",
    resolvedAt: serverTimestamp(),
  });

  if (notificationId) {
    await updateDoc(doc(firebase_fs, "notifications", notificationId), {
      read: true,
    });
  }
}
