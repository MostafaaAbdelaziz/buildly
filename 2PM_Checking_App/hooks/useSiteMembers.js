import { useCallback, useState } from "react";
import {
  findUserByEmail,
  inviteUserToSite,
  acceptInvite,
  rejectInvite,
  removeSiteMember,
} from "../services/siteMemberRepository";

/**
 * Hook that wraps siteMemberRepository actions with loading/error state.
 *
 * @param {object} inviter - { uid, name } of the current logged-in manager
 */
export function useSiteMembers(inviter) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Invite a user by email to a site.
   * Resolves the email → UID via RTDB, then creates site_members + notification.
   *
   * @param {object} params
   * @param {string} params.siteId
   * @param {string} params.siteName
   * @param {string} params.email     - Target user's email
   * @param {string} params.role      - "WORKER" | "FOREMAN" | "MANAGER"
   * @returns {Promise<"ok"|"not_found">}
   */
  const inviteByEmail = useCallback(
    async ({ siteId, siteName, email, role }) => {
      setLoading(true);
      setError(null);
      try {
        const targetUserId = await findUserByEmail(email.trim().toLowerCase());
        if (!targetUserId) {
          setError("No account found with that email.");
          return "not_found";
        }

        await inviteUserToSite({
          siteId,
          siteName,
          targetUserId,
          role,
          inviterUid: inviter.uid,
          inviterName: inviter.name,
        });

        return "ok";
      } catch (err) {
        setError(err.message || "Failed to send invite.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [inviter]
  );

  const handleAccept = useCallback(async (membershipId, notificationId) => {
    setLoading(true);
    setError(null);
    try {
      await acceptInvite(membershipId, notificationId);
    } catch (err) {
      setError(err.message || "Failed to accept invite.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReject = useCallback(async (membershipId, notificationId) => {
    setLoading(true);
    setError(null);
    try {
      await rejectInvite(membershipId, notificationId);
    } catch (err) {
      setError(err.message || "Failed to reject invite.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemove = useCallback(async (membershipId) => {
    setLoading(true);
    setError(null);
    try {
      await removeSiteMember(membershipId);
    } catch (err) {
      setError(err.message || "Failed to remove member.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { inviteByEmail, handleAccept, handleReject, handleRemove, loading, error };
}
