import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import IssueImagePicker from "../components/IssueImagePicker";
import { useFolders } from "../hooks/useFolders";
import { useDrawings } from "../hooks/useDrawings";
import { useAuth } from "../context/AuthContext";
import { getRoleConfig } from "../constants/roleConfig";

const GRID_COLUMNS = 3;

function formatBytes(bytes) {
  if (bytes == null || bytes === undefined || Number.isNaN(Number(bytes))) return "—";
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTs(ts) {
  if (!ts) return "—";
  try {
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export default function DrawingsScreen({ navigation, route }) {
  const { siteId, siteName } = route.params ?? {};
  const { role } = useAuth();
  const isManager = role == "manager";
  const { folders, loading: foldersLoading, error: foldersError, createFolder, renameFolder, deleteFolder } = useFolders(siteId);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [viewMode, setViewMode] = useState("icons");
  const [pendingImageUri, setPendingImageUri] = useState(null);


  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folders.find((f) => f.id === currentFolderId) ?? null;
  }, [folders, currentFolderId]);

  const childFolders = useMemo(() => {
    const pid = currentFolderId ?? null;
    return folders
      .filter((f) => (f.parentId ?? null) === pid)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [folders, currentFolderId]);

  useEffect(() => {
    if (!currentFolderId) return;
    if (!folders.some((f) => f.id === currentFolderId)) {
      setCurrentFolderId(null);
    }
  }, [folders, currentFolderId]);

  const { drawings, loading: drawingsLoading, error: drawingsError, uploadDrawing, renameDrawing, deleteDrawing } = useDrawings(
    siteId,
    currentFolder
  );

  const items = useMemo(() => {
    const folderRows = childFolders.map((folder) => ({ kind: "folder", ...folder }));
    const drawingRows = currentFolder
      ? [...drawings]
          .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
          .map((d) => ({ kind: "drawing", ...d }))
      : [];
    return [...folderRows, ...drawingRows];
  }, [childFolders, drawings, currentFolder]);

  const windowWidth = Dimensions.get("window").width;
  const gridTileWidth = (windowWidth - 32 - 8 * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  function handleBack() {
    if (!currentFolderId) return;
    const folder = folders.find((f) => f.id === currentFolderId);
    setCurrentFolderId(folder?.parentId ?? null);
  }

  function handleCreateFolder() {
    if (!isManager) {
      Alert.alert("Restricted", "Only managers can create folders.");
      return;
    }
    const parent = currentFolder;
    Alert.prompt?.("New Folder", "Enter folder name", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: async (name) => {
          if (!name?.trim()) return;
          try {
            await createFolder({ name: name.trim(), parent: parent ?? null });
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to create folder.");
          }
        },
      },
    ]);
  }

  async function handleUpload() {
    if (!isManager) {
      Alert.alert("Restricted", "You don't have permission to upload drawings.");
      return;
    }
    if (!pendingImageUri) {
      Alert.alert("Select image", "Pick or capture an image first.");
      return;
    }
    if (!currentFolder) {
      Alert.alert("Open a folder", "Open a folder before uploading.");
      return;
    }

    try {
      await uploadDrawing(pendingImageUri, {
        title: "Drawing",
        description: "",
      });
      setPendingImageUri(null);
    } catch (e) {
      Alert.alert("Upload failed", e?.message || "Could not upload drawing.");
    }
  }

  const openFolder = useCallback((folderId) => {
    setCurrentFolderId(folderId);
  }, []);

  async function renameItem(item, newName) {
    try {
      if (item.kind === "folder") {
        await renameFolder(item, newName);
      } else{
        await renameDrawing(item, newName);
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to rename.");
    }
  }

  async function deleteItem(item) {
    try {
      if (item.kind === "folder") {
        await deleteFolder(item);
      } else{
        await deleteDrawing(item);
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to delete.");
    }
  }

  const renderIconItem = useCallback(
    ({ item }) => {
      if (item.kind === "folder") {
        return (
          <TouchableOpacity
            style={[styles.gridCell, { width: gridTileWidth }]}
            onPress={() => openFolder(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Folder ${item.name}`}
          >
            <View style={styles.gridIconWrap}>
              <Ionicons name="folder" size={44} color="#CA8A04" />
            </View>
            <Text style={styles.gridLabel} numberOfLines={2}>
              {item.name}
            </Text>

          {isManager ? (
            <TouchableOpacity
              onPress={() => openItemActions(item)}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#4B5563" />
            </TouchableOpacity>
          ) : null}
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={[styles.gridCell, { width: gridTileWidth }]}
          onPress={() => navigation.navigate("DrawingDetail", { siteId, drawingId: item.id })}
          accessibilityRole="button"
          accessibilityLabel={item.title || "Drawing"}
        >
          <View style={styles.gridThumbWrap}>
            {item.fileUrl ? (
              <Image source={{ uri: item.fileUrl }} style={styles.gridThumb} resizeMode="cover" />
            ) : (
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            )}
          </View>
          <Text style={styles.gridLabel} numberOfLines={2}>
            {item.title || "Drawing"}
          </Text>

          {isManager ? (
            <TouchableOpacity
              onPress={() => openItemActions(item)}
              hitSlop={10}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#4B5563" />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      );
    },
    [gridTileWidth, navigation, openFolder, siteId]
  );

  const renderListItem = useCallback(
    ({ item }) => {
      if (item.kind === "folder") {
        return (
          <TouchableOpacity style={styles.listRow} onPress={() => openFolder(item.id)}>
            <Ionicons name="folder" size={22} color="#CA8A04" style={styles.listIcon} />
            <View style={styles.listMain}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.listSub}>Folder · {formatTs(item.updatedAt)}</Text>
            </View>

            {isManager ? (
              <TouchableOpacity
                onPress={() => openItemActions(item)}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color="#4B5563" />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={styles.listRow}
          onPress={() => navigation.navigate("DrawingDetail", { siteId, drawingId: item.id })}
        >
          <Ionicons name="document-text-outline" size={22} color="#4B5563" style={styles.listIcon} />
          <View style={styles.listMain}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {item.title || "Drawing"}
            </Text>
            <Text style={styles.listSub}>
              {formatBytes(item.fileSizeBytes)} · v{item.version || 1} · {formatTs(item.updatedAt)}
            </Text>
          </View>

          {isManager ? (
            <TouchableOpacity
              onPress={() => openItemActions(item)}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#4B5563" />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      );
    },
    [navigation, openFolder, siteId]
  );

  const loading = foldersLoading || (currentFolder && drawingsLoading);
  const listError = foldersError || (currentFolder && drawingsError);

  const [selectedItem, setSelectedItem] = useState(null);

  function openItemActions(item) {
    if(!isManager) { return; }

    setSelectedItem(item);

    const isFolder = item.kind === "folder";
    const options = isFolder
      ? ["Open", "Rename", "Delete", "Cancel"]
      : ["View", "Rename", "Delete", "Cancel"];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = 2;

  
    Alert.alert(
      item.kind === "folder" ? "Folder actions" : "File actions",
      item.name || item.title || "Item",
      options.map((option, index) => ({
        text: option,
        style:
          index === cancelButtonIndex
            ? "cancel"
            : index === destructiveButtonIndex
            ? "destructive"
            : "default",
        onPress: () => handleItemAction(item, option.toLowerCase()),
      }))
    );
  }


  function handleItemAction(item, action) {

  if(action === "open") {
    if (item.kind === "folder") {
      setCurrentFolderId(item.id);
    }
  }
  if(action === "view") {
    if (item.kind === "drawing") {
      navigation.navigate("DrawingDetail", { siteId, drawingId: item.id });
    }
  }

  if (action === "rename") {
    Alert.prompt?.("Rename", "Enter new name", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: async (name) => {
          if (!name?.trim()) return;
          await renameItem(item, name.trim());
        },
      },
    ], "plain-text", item.name || item.title || "");
  }

  if (action === "delete") {
    Alert.alert("Delete", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem(item);
        },
      },
    ]);
  }
}

  return (
    <Screen edges={[]}>
      <View style={styles.container}>
        <Text style={styles.header}>{siteName ? `${siteName} — Drawings` : "Drawings"}</Text>

        <View style={styles.toolbar}>
          {currentFolderId ? (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === "icons" && styles.toggleBtnActive]}
              onPress={() => setViewMode("icons")}
            >
              <Ionicons name="grid-outline" size={20} color={viewMode === "icons" ? "#111827" : "#6B7280"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
              onPress={() => setViewMode("list")}
            >
              <Ionicons name="list-outline" size={20} color={viewMode === "list" ? "#111827" : "#6B7280"} />
            </TouchableOpacity>
          </View>
          {isManager ? (
            <TouchableOpacity onPress={handleCreateFolder}>
              <Text style={styles.sectionAction}>+ New folder</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.listWrap}>
          {loading ? (
            <ActivityIndicator style={styles.loader} />
          ) : listError ? (
            <Text style={styles.errorText}>{listError.message || "Failed to load."}</Text>
          ) : (
            <FlatList
              key={viewMode}
              style={styles.flex1}
              data={items}
              keyExtractor={(item) => (item.kind === "folder" ? `f-${item.id}` : `d-${item.id}`)}
              numColumns={viewMode === "icons" ? GRID_COLUMNS : 1}
              renderItem={viewMode === "icons" ? renderIconItem : renderListItem}
              contentContainerStyle={viewMode === "icons" ? styles.gridList : styles.listList}
              columnWrapperStyle={viewMode === "icons" ? styles.gridRow : undefined}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {currentFolder ? "No items in this folder." : "No folders yet. Create one to get started."}
                </Text>
              }
            />
          )}
        </View>

        {currentFolder && isManager ? (
          <View style={styles.uploadSection}>
            <IssueImagePicker value={pendingImageUri} onChange={setPendingImageUri} />
            <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={!isManager}>
              <Text style={styles.uploadText}>Upload drawing</Text>
            </TouchableOpacity>
          </View>
        ): null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 16,
  },
  backPlaceholder: {
    width: 72,
  },
  breadcrumb: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  viewToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  toggleBtnActive: {
    backgroundColor: "#E5E7EB",
  },
  sectionAction: {
    fontWeight: "700",
    color: "#2563EB",
  },
  listWrap: {
    flex: 1,
    minHeight: 120,
  },
  flex1: {
    flex: 1,
  },
  loader: {
    marginTop: 24,
  },
  gridList: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  gridCell: {
    alignItems: "center",
    marginBottom: 12,
  },
  gridIconWrap: {
    height: 72,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  gridThumbWrap: {
    height: 72,
    width: 72,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  gridThumb: {
    width: "100%",
    height: "100%",
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
    maxWidth: "100%",
  },
  listList: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  listIcon: {
    marginRight: 12,
  },
  listMain: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111827",
  },
  listSub: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12,
  },
  uploadSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  uploadBtn: {
    marginTop: 12,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadText: {
    color: "white",
    fontWeight: "700",
  },
  hint: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },
  emptyText: { color: "#6B7280", textAlign: "center", marginTop: 24 },
  errorText: { color: "#DC2626" },
});
