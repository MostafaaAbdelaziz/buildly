import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

/**
 * Registers for push notifications and stores the Expo push token
 * in Firestore under users/{uid} so Cloud Functions can reach this device.
 *
 * Must be called after the user is authenticated.
 * Safe to call on every mount — it no-ops if permission was already granted.
 *
 * @param {string|null} uid - Firebase Auth UID of the current user
 */
export function useFcmToken(uid) {
  useEffect(() => {
    if (!uid) return;

    async function register() {
      if (!Device.isDevice) {
        // Push notifications don't work in the simulator
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted.");
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      const pushToken = tokenData.data;

      await setDoc(
        doc(firebase_fs, "users", uid),
        {
          pushToken,
          pushTokenUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    register().catch((e) =>
      console.warn("useFcmToken registration error:", e?.message)
    );
  }, [uid]);
}
