import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../../constants/theme";

const CARD_W = 280;
const GAP = 8;

/**
 * Long-press task menu: full title, actions, delay stepper, rename modal content.
 */
export default function GanttTaskNameMenu({
  visible,
  task,
  anchor,
  onClose,
  onDelayByDays,
  onRename,
  onDelete,
}) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [step, setStep] = useState("menu");
  const [delayDays, setDelayDays] = useState(1);
  const [renameText, setRenameText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible && task) {
      setStep("menu");
      setDelayDays(1);
      setRenameText(task.name || "");
    }
  }, [visible, task?.id]);

  const position = useMemo(() => {
    if (!anchor || !task) return { top: winH / 2 - 120, left: (winW - CARD_W) / 2 };
    const cardH =
      step === "menu" ? 220 : step === "delay" ? 200 : 220;
    let top = anchor.y + anchor.height + GAP;
    if (top + cardH > winH - 24) {
      top = Math.max(24, anchor.y - cardH - GAP);
    }
    let left = anchor.x;
    left = Math.max(8, Math.min(left, winW - CARD_W - 8));
    return { top, left };
  }, [anchor, task, step, winW, winH]);

  async function run(fn) {
    setBusy(true);
    try {
      await fn();
      onClose();
    } catch (e) {
      if (e?.message !== "__cancel__") {
        Alert.alert("Error", e?.message || "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!task) return;
    Alert.alert("Delete task", `Delete "${task.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => run(() => onDelete(task.id)),
      },
    ]);
  }

  function handleApplyDelay() {
    if (!task || delayDays < 1) return;
    run(() => onDelayByDays(task.id, delayDays));
  }

  function handleSaveRename() {
    const t = renameText.trim();
    if (!task || !t) {
      Alert.alert("Missing info", "Please enter a task title.");
      return;
    }
    run(() => onRename(task.id, t));
  }

  if (!visible || !task) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
          pointerEvents="box-none"
        >
          <Pressable
            style={[styles.card, { top: position.top, left: position.left, width: CARD_W }]}
            onPress={(e) => e.stopPropagation()}
          >
            {busy ? (
              <View style={styles.busy}>
                <ActivityIndicator color={colors.text} />
              </View>
            ) : null}

            {step === "menu" && (
              <>
                <Text style={styles.fullTitle}>{task.name}</Text>
                <Pressable
                  style={styles.menuBtn}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setStep("delay");
                  }}
                >
                  <Text style={styles.menuBtnText}>Add delay by…</Text>
                </Pressable>
                <Pressable
                  style={styles.menuBtn}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setStep("rename");
                  }}
                >
                  <Text style={styles.menuBtnText}>Rename</Text>
                </Pressable>
                <Pressable
                  style={[styles.menuBtn, styles.menuBtnDanger]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    handleDelete();
                  }}
                >
                  <Text style={styles.menuBtnDangerText}>Delete task</Text>
                </Pressable>
              </>
            )}

            {step === "delay" && (
              <>
                <Text style={styles.sectionTitle}>Delay end date by</Text>
                <Text style={styles.hint} numberOfLines={2}>
                  {task.name}
                </Text>
                <View style={styles.stepper}>
                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => setDelayDays((d) => Math.max(1, d - 1))}
                    disabled={busy}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.stepValue}>{delayDays}</Text>
                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => setDelayDays((d) => d + 1)}
                    disabled={busy}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </Pressable>
                </View>
                <Text style={styles.dayLabel}>day{delayDays === 1 ? "" : "s"}</Text>
                <View style={styles.rowBtns}>
                  <Pressable style={styles.secondaryBtn} onPress={() => setStep("menu")} disabled={busy}>
                    <Text style={styles.secondaryBtnText}>Back</Text>
                  </Pressable>
                  <Pressable style={styles.primaryBtn} onPress={handleApplyDelay} disabled={busy}>
                    <Text style={styles.primaryBtnText}>Apply</Text>
                  </Pressable>
                </View>
              </>
            )}

            {step === "rename" && (
              <>
                <Text style={styles.sectionTitle}>Rename task</Text>
                <TextInput
                  style={styles.input}
                  value={renameText}
                  onChangeText={setRenameText}
                  placeholder="Title"
                  placeholderTextColor={colors.textSecondary}
                  editable={!busy}
                  autoFocus
                />
                <View style={styles.rowBtns}>
                  <Pressable style={styles.secondaryBtn} onPress={() => setStep("menu")} disabled={busy}>
                    <Text style={styles.secondaryBtnText}>Back</Text>
                  </Pressable>
                  <Pressable style={styles.primaryBtn} onPress={handleSaveRename} disabled={busy}>
                    <Text style={styles.primaryBtnText}>Save</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  keyboard: {
    flex: 1,
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
  busy: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 10,
    zIndex: 2,
  },
  fullTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
    textTransform: "none",
  },
  menuBtn: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  menuBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  menuBtnDanger: {
    borderBottomWidth: 0,
  },
  menuBtnDangerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#b91c1c",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 4,
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#111",
    backgroundColor: "#f3f4f6",
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  stepValue: {
    fontSize: 22,
    fontWeight: "900",
    minWidth: 40,
    textAlign: "center",
    color: colors.text,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  rowBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#111",
    borderRadius: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
});
