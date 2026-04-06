import { useEffect, useState } from "react";
import {
  listenDrawingsInFolder,
  uploadDrawing as repoUploadDrawing,
  replaceDrawing as repoReplaceDrawing,
  renameDrawing as repoRenameDrawing,
  deleteDrawing as repoDeleteDrawing,
} from "../services/drawingRepository";

export function useDrawings(siteId, folder) {
  const folderId = folder?.id || null;
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!siteId || !folderId) {
      setDrawings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = listenDrawingsInFolder(siteId, folderId, {
      onNext: (items) => {
        setDrawings(items);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });

    return () => unsubscribe && unsubscribe();
  }, [siteId, folderId]);

  async function uploadDrawing(localUri, metadata) {
    return repoUploadDrawing(siteId, folder, localUri, metadata);
  }

  async function replaceDrawing(drawing, localUri, metadata) {
    return repoReplaceDrawing(siteId, drawing, localUri, metadata);
  }

  async function renameDrawing(drawing, newName) {
    return repoRenameDrawing(siteId, drawing, newName);
  }
  
  async function deleteDrawing(drawing) {
    return repoDeleteDrawing(siteId, drawing);
  }

  return {
    drawings,
    loading,
    error,
    uploadDrawing,
    replaceDrawing,
    renameDrawing,
    deleteDrawing,
  };
}

