import { useEffect, useState } from "react";
import { listenFolders, createFolder, renameFolder } from "../services/drawingRepository";

export function useFolders(siteId) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = listenFolders(siteId, {
      onNext: (items) => {
        setFolders(items);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });

    return () => unsubscribe && unsubscribe();
  }, [siteId]);

  return {
    folders,
    loading,
    error,
    createFolder: (payload) => createFolder(siteId, payload),
    renameFolder: (folder, newName) => renameFolder(siteId, folder, newName),
  };
}

