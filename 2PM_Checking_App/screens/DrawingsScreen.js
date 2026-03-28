import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import Screen from "../components/Screen";
import IssueImagePicker from "../components/IssueImagePicker";
import { useFolders } from "../hooks/useFolders";
import { useDrawings } from "../hooks/useDrawings";
import { useAuth } from "../context/AuthContext";
import { getRoleConfig } from "../constants/roleConfig";

export default function DrawingsScreen({ navigation, route }) {
  const { siteId, siteName } = route.params ?? {};
  const { role } = useAuth();
  const roleCfg = getRoleConfig(role);
  const canEdit = roleCfg?.canCreateIssue || roleCfg?.canResolveIssue || roleCfg?.canCreateSchedule;
  const { folders, loading: foldersLoading, error: foldersError, createFolder } = useFolders(siteId);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const activeFolder = useMemo(
    () => folders.find((f) => f.id === activeFolderId) || folders[0] || null,
    [folders, activeFolderId]
  );

  const { drawings, loading: drawingsLoading, error: drawingsError, uploadDrawing } = useDrawings(
    siteId,
    activeFolder
  );

  const [pendingImageUri, setPendingImageUri] = useState(null);

  function handleCreateFolder() {
    if (!canEdit) {
      Alert.alert("Restricted", "Only managers can create folders.");
      return;
    }
    Alert.prompt?.("New Folder", "Enter folder name", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: async (name) => {
          if (!name) return;
          try {
            await createFolder({ name, parent: null });
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to create folder.");
          }
        },
      },
    ]);
  }

  async function handleUpload() {
    if (!canEdit) {
      Alert.alert("Restricted", "You don't have permission to upload drawings.");
      return;
    }
    if (!pendingImageUri) {
      Alert.alert("Select image", "Pick or capture an image first.");
      return;
    }
    if (!activeFolder) {
      Alert.alert("No folder", "Create or select a folder first.");
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

  function renderFolderItem({ item }) {
    const isActive = activeFolder && activeFolder.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.folderItem, isActive && styles.folderItemActive]}
        onPress={() => setActiveFolderId(item.id)}
      >
        <Text style={styles.folderName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  function renderDrawingItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.drawingCard}
        onPress={() => navigation.navigate("DrawingDetail", { siteId, drawingId: item.id })}
      >
        <Text style={styles.drawingTitle} numberOfLines={1}>
          {item.title || "Drawing"}
        </Text>
        <Text style={styles.drawingMeta}>v{item.version || 1}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.header}>{siteName ? `${siteName} — Drawings` : "Drawings"}</Text>

        <View style={styles.layout}>
          <View style={styles.leftPane}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Folders</Text>
              <TouchableOpacity onPress={handleCreateFolder}>
                <Text style={styles.sectionAction}>+ New</Text>
              </TouchableOpacity>
            </View>

            {foldersLoading ? (
              <ActivityIndicator />
            ) : foldersError ? (
              <Text style={styles.errorText}>{foldersError.message || "Failed to load folders."}</Text>
            ) : (
              <FlatList
                data={folders}
                keyExtractor={(item) => item.id}
                renderItem={renderFolderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No folders yet.</Text>}
              />
            )}
          </View>

          <View style={styles.rightPane}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Drawings</Text>
            </View>

            {drawingsLoading ? (
              <ActivityIndicator />
            ) : drawingsError ? (
              <Text style={styles.errorText}>{drawingsError.message || "Failed to load drawings."}</Text>
            ) : (
              <FlatList
                data={drawings}
                keyExtractor={(item) => item.id}
                renderItem={renderDrawingItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No drawings in this folder.</Text>}
              />
            )}

            <IssueImagePicker value={pendingImageUri} onChange={setPendingImageUri} />

            <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
              <Text style={styles.uploadText}>Upload drawing</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  layout: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  leftPane: {
    width: 140,
  },
  rightPane: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionAction: {
    fontWeight: "700",
    color: "#2563EB",
  },
  folderItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  folderItemActive: {
    backgroundColor: "#E5E7EB",
  },
  folderName: {
    fontWeight: "600",
  },
  drawingCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  drawingTitle: {
    fontWeight: "700",
  },
  drawingMeta: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 12,
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
  emptyText: { color: "#6B7280" },
  errorText: { color: "#DC2626" },
});

