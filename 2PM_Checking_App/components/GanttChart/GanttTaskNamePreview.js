import React, { useMemo } from "react";
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { colors } from "../../constants/theme";

const CARD_W = 280;
const GAP = 8;

/** Read-only long-press popover: full task title only (foreman / subcontractor). */
export default function GanttTaskNamePreview({ visible, task, anchor, onClose }) {
  const { width: winW, height: winH } = useWindowDimensions();

  const position = useMemo(() => {
    if (!anchor || !task) return { top: winH / 2 - 60, left: (winW - CARD_W) / 2 };
    const cardH = 120;
    let top = anchor.y + anchor.height + GAP;
    if (top + cardH > winH - 24) {
      top = Math.max(24, anchor.y - cardH - GAP);
    }
    let left = anchor.x;
    left = Math.max(8, Math.min(left, winW - CARD_W - 8));
    return { top, left };
  }, [anchor, task, winW, winH]);

  if (!visible || !task) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { top: position.top, left: position.left, width: CARD_W }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.label}>Task</Text>
          <Text style={styles.fullTitle}>{task.name}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fullTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    textTransform: "none",
  },
});
