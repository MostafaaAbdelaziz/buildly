import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { firebase_fs } from "../firebaseConfig/firebaseConfig";
import { uploadDrawingFile } from "./storageProvider";

// Helpers ------------------------------------------------------------------

function siteFoldersCol(siteId) {
  return collection(firebase_fs, "sites", siteId, "folders");
}

function siteDrawingsCol(siteId) {
  return collection(firebase_fs, "sites", siteId, "drawings");
}

function computePath(name, parent) {
  const trimmed = (name || "").trim();
  if (!parent || !parent.path) return trimmed;
  return `${parent.path}/${trimmed}`;
}

export function listenFolders(siteId, { onNext, onError }) {
  if (!siteId) return () => {};
  const q = query(siteFoldersCol(siteId), orderBy("path"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onNext?.(items);
    },
    (err) => onError?.(err)
  );
}

export function listenDrawingsInFolder(siteId, folderId, { onNext, onError }) {
  if (!siteId || !folderId) return () => {};
  const q = query(
    siteDrawingsCol(siteId),
    where("folderId", "==", folderId),
    where("isLatest", "==", true),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onNext?.(items);
    },
    (err) => onError?.(err)
  );
}

export async function createFolder(siteId, { name, parent }) {
  if (!siteId) throw new Error("siteId is required");
  const now = serverTimestamp();
  const depth = parent ? (parent.depth || 0) + 1 : 0;
  const path = computePath(name, parent);

  await addDoc(siteFoldersCol(siteId), {
    name: (name || "").trim(),
    parentId: parent?.id || null,
    path,
    depth,
    createdAt: now,
    updatedAt: now,
  });
}

export async function renameFolder(siteId, folder, newName) {
  if (!siteId || !folder?.id) throw new Error("folder id and siteId are required");

  const trimmed = (newName || "").trim();
  if (!trimmed) return;

  const foldersRef = siteFoldersCol(siteId);

  // Old and new paths
  const oldPath = folder.path || folder.name;
  const parentPath = oldPath.includes("/") ? oldPath.slice(0, oldPath.lastIndexOf("/")) : "";
  const newPath = parentPath ? `${parentPath}/${trimmed}` : trimmed;

  const batch = writeBatch(firebase_fs);

  // Update this folder
  const thisDoc = doc(foldersRef, folder.id);
  batch.update(thisDoc, { name: trimmed, path: newPath, updatedAt: serverTimestamp() });

  // Update all descendants whose path starts with oldPath + "/"
  const descendantsQ = query(foldersRef, where("path", ">=", `${oldPath}/`), where("path", "<", `${oldPath}0`));
  const snap = await getDocs(descendantsQ);
  snap.forEach((d) => {
    const data = d.data();
    const childPath = data.path || "";
    if (!childPath.startsWith(`${oldPath}/`)) return;
    const suffix = childPath.slice(oldPath.length);
    const updated = `${newPath}${suffix}`;
    batch.update(d.ref, { path: updated, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}

export async function uploadDrawing(siteId, folder, localUri, metadata = {}) {
  if (!siteId || !folder?.id) throw new Error("siteId and folder are required");
  if (!localUri) throw new Error("localUri is required");

  const folderPath = folder.path || folder.name || "root";
  const uploadResult = await uploadDrawingFile(localUri, { siteId, folderPath });

  const now = serverTimestamp();

  await addDoc(siteDrawingsCol(siteId), {
    folderId: folder.id,
    title: metadata.title || "Untitled drawing",
    description: metadata.description || "",
    storagePath: uploadResult.storagePath || null,
    fileUrl: uploadResult.url,
    provider: uploadResult.provider,
    fileSizeBytes: uploadResult.fileSizeBytes ?? null,
    mimeType: uploadResult.mimeType ?? null,
    version: 1,
    isLatest: true,
    uploadedByUserId: metadata.uploadedByUserId || null,
    uploadedAt: now,
    updatedAt: now,
  });
}

export async function replaceDrawing(siteId, drawing, localUri, metadata = {}) {
  if (!siteId || !drawing?.id) throw new Error("drawing id and siteId are required");
  if (!localUri) throw new Error("localUri is required");

  const folderPath = metadata.folderPath || "root";
  const uploadResult = await uploadDrawingFile(localUri, { siteId, folderPath });

  const drawingsCol = siteDrawingsCol(siteId);
  const drawingRef = doc(drawingsCol, drawing.id);

  const nextVersion = (drawing.version || 1) + 1;
  const now = serverTimestamp();

  await updateDoc(drawingRef, {
    fileUrl: uploadResult.url,
    storagePath: uploadResult.storagePath || null,
    provider: uploadResult.provider,
    fileSizeBytes: uploadResult.fileSizeBytes ?? null,
    mimeType: uploadResult.mimeType ?? null,
    version: nextVersion,
    isLatest: true,
    description: metadata.description ?? drawing.description ?? "",
    title: metadata.title ?? drawing.title ?? "Untitled drawing",
    updatedAt: now,
  });
}

export async function renameDrawing(siteId, drawing, newName) {
  const drawingRef = doc(siteDrawingsCol(siteId), drawing.id);
  await updateDoc(drawingRef, {
    title: newName,
    updatedAt: serverTimestamp(),
  });
}

