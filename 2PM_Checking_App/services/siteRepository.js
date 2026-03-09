import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";

function sitesCol() {
  return collection(firebase_fs, "sites");
}

export function buildSitePayload({
  name,
  projectManagerId,
  addressLine1,
  addressLine2,
  cityState,
  description,
  startDate,
}) {
  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    throw new Error("Site name is required");
  }
  if (!projectManagerId) {
    throw new Error("projectManagerId is required");
  }

  const now = serverTimestamp();

  const payload = {
    name: trimmedName,
    projectManagerId,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };

  const address = {
    line1: (addressLine1 || "").trim() || null,
    line2: (addressLine2 || "").trim() || null,
    cityState: (cityState || "").trim() || null,
  };

  if (address.line1 || address.line2 || address.cityState) {
    payload.address = address;
  }

  if (description && description.trim()) {
    payload.description = description.trim();
  }

  if (startDate) {
    payload.startDate = startDate;
  }

  return payload;
}

export async function createSite(docData) {
  const ref = await addDoc(sitesCol(), docData);
  return ref;
}
