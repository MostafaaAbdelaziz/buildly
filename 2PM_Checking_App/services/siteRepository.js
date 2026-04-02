import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
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
  foremanEmail,
  location,
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

  if (foremanEmail && foremanEmail.trim()) {
    payload.foremanEmail = foremanEmail.trim();
  }

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

  const lat = typeof location?.latitude === "string" ? parseFloat(location.latitude) : location?.latitude;
  const lng = typeof location?.longitude === "string" ? parseFloat(location.longitude) : location?.longitude;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    payload.location = { latitude: lat, longitude: lng };
  }

  return payload;
}

export async function createSite(docData) {
  const ref = await addDoc(sitesCol(), docData);
  return ref;
}

export async function updateSiteForeman(siteId, foremanEmail) {
  if (!siteId) {
    throw new Error("siteId is required");
  }
  const siteRef = doc(firebase_fs, "sites", siteId);

  await updateDoc(siteRef, {
    foremanEmail: foremanEmail?.trim() || null,
    updatedAt: serverTimestamp(),
  });
}

export async function softDeleteSite(siteId) {
  if (!siteId) {
    throw new Error("siteId is required");
  }
  const siteRef = doc(firebase_fs, "sites", siteId);
  await updateDoc(siteRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createIssueForSite(issueData) {
  const siteRef = await addDoc(collection(firebase_fs, "issues"), {
    ...issueData,
    status : issueData.status || "Open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return siteRef;
}

export async function updateIssueStatus(issueId, status) {
  if (!issueId) {
    throw new Error("issueId is required");
  }

  const issueRef = doc(firebase_fs, "issues", issueId);

  await updateDoc(issueRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
