import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import ThemedTextInput from "../components/ThemedTextInput";
import { colors } from "../constants/theme";
import { useSiteSchedules } from "../hooks/useSiteSchedules";
import { useSchedulePhases } from "../hooks/useSchedulePhases";
import { usePhaseTasks } from "../hooks/usePhaseTasks";
import { useAuth } from "../context/AuthContext";

// ─── TaskRow ─────────────────────────────────────────────────────────────────

function TaskRow({ task, onUpdate, onDelete, isManager }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  function commitEdit() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed });
    } else {
      setTitle(task.title);
    }
    setEditing(false);
  }

  function confirmDelete() {
    Alert.alert("Delete Task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(task.id) },
    ]);
  }

  const isDone = task.status === "DONE";

  return (
    <View style={s.taskRow}>
      <Pressable
        onPress={() =>
          isManager && onUpdate(task.id, { status: isDone ? "PENDING" : "DONE" })
        }
        hitSlop={4}
        style={s.checkboxWrap}
      >
        <View style={[s.checkbox, isDone && s.checkboxDone]}>
          {isDone && (
            <AppText variant="caption" bold style={s.checkmark}>
              ✓
            </AppText>
          )}
        </View>
      </Pressable>

      {editing ? (
        <ThemedTextInput
          value={title}
          onChangeText={setTitle}
          onBlur={commitEdit}
          onSubmitEditing={commitEdit}
          autoFocus
          style={s.taskEditInput}
          inputStyle={{ minHeight: 38 }}
          returnKeyType="done"
        />
      ) : (
        <Pressable
          onPress={() => isManager && setEditing(true)}
          style={s.taskTitleArea}
        >
          <AppText
            variant="body"
            style={isDone ? s.taskDone : undefined}
          >
            {task.title}
          </AppText>
        </Pressable>
      )}

      {isManager && (
        <Pressable onPress={confirmDelete} hitSlop={10} style={s.rowDeleteBtn}>
          <AppText variant="caption" style={s.rowDeleteIcon}>
            ✕
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

// ─── PhaseTasksSection (only mounted when phase is expanded) ──────────────────

function PhaseTasksSection({ phase, siteId, isManager }) {
  const { tasks, loading, addTask, updateTask, deleteTask } = usePhaseTasks(
    phase.id,
    siteId
  );
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAddTask() {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addTask(trimmed);
      setNewTaskTitle("");
      setAddingTask(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to add task.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ActivityIndicator size="small" style={s.loader} />;
  }

  return (
    <View style={s.tasksSection}>
      {tasks.length === 0 && !addingTask && (
        <AppText variant="caption" style={s.emptyHint}>
          No tasks yet.
        </AppText>
      )}

      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onUpdate={updateTask}
          onDelete={deleteTask}
          isManager={isManager}
        />
      ))}

      {isManager &&
        (addingTask ? (
          <View style={s.inlineForm}>
            <ThemedTextInput
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Task name..."
              autoFocus
              onSubmitEditing={handleAddTask}
              returnKeyType="done"
              style={s.inlineInput}
              inputStyle={{ minHeight: 40 }}
            />
            <View style={s.inlineActions}>
              <Button
                title="Add"
                variant="primary"
                size="sm"
                onPress={handleAddTask}
                loading={saving}
              />
              <Button
                title="Cancel"
                variant="secondary"
                size="sm"
                onPress={() => {
                  setAddingTask(false);
                  setNewTaskTitle("");
                }}
                disabled={saving}
              />
            </View>
          </View>
        ) : (
          <Button
            title="+ Add Task"
            variant="secondary"
            size="sm"
            onPress={() => setAddingTask(true)}
            style={s.addSubBtn}
          />
        ))}
    </View>
  );
}

// ─── PhaseRow ─────────────────────────────────────────────────────────────────

function PhaseRow({ phase, siteId, onUpdate, onDelete, isManager }) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(phase.name);

  function commitNameEdit() {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== phase.name) {
      onUpdate(phase.id, { name: trimmed });
    } else {
      setNameVal(phase.name);
    }
    setEditingName(false);
  }

  function confirmDelete() {
    Alert.alert(
      "Delete Phase",
      `Delete "${phase.name}" and all its tasks? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(phase.id),
        },
      ]
    );
  }

  const dateLabel =
    phase.startDate || phase.endDate
      ? `${phase.startDate || "—"}  →  ${phase.endDate || "—"}`
      : null;

  return (
    <View style={s.phaseContainer}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={s.phaseHeader}
      >
        <AppText variant="caption" style={s.phaseArrow}>
          {expanded ? "▼" : "▶"}
        </AppText>

        <View style={s.phaseNameBlock}>
          {editingName ? (
            <ThemedTextInput
              value={nameVal}
              onChangeText={setNameVal}
              onBlur={commitNameEdit}
              onSubmitEditing={commitNameEdit}
              autoFocus
              style={s.phaseNameInput}
              inputStyle={{ minHeight: 38 }}
              returnKeyType="done"
            />
          ) : (
            <Pressable onPress={() => isManager && setEditingName(true)}>
              <AppText variant="body" bold>
                {phase.name}
              </AppText>
              {dateLabel ? (
                <AppText variant="caption" style={s.phaseDates}>
                  {dateLabel}
                </AppText>
              ) : null}
            </Pressable>
          )}
        </View>

        {isManager && (
          <Pressable
            onPress={confirmDelete}
            hitSlop={10}
            style={s.rowDeleteBtn}
          >
            <AppText variant="caption" style={s.rowDeleteIcon}>
              ✕
            </AppText>
          </Pressable>
        )}
      </Pressable>

      {expanded && (
        <PhaseTasksSection phase={phase} siteId={siteId} isManager={isManager} />
      )}
    </View>
  );
}

// ─── SchedulePhasesSection (only mounted when schedule is expanded) ─────────

function SchedulePhasesSection({ schedule, siteId, isManager }) {
  const { phases, loading, addPhase, updatePhase, deletePhase } =
    useSchedulePhases(schedule.id);
  const [addingPhase, setAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseStart, setNewPhaseStart] = useState("");
  const [newPhaseEnd, setNewPhaseEnd] = useState("");
  const [saving, setSaving] = useState(false);

  function resetPhaseForm() {
    setAddingPhase(false);
    setNewPhaseName("");
    setNewPhaseStart("");
    setNewPhaseEnd("");
  }

  async function handleAddPhase() {
    if (!newPhaseName.trim()) return;
    setSaving(true);
    try {
      await addPhase(schedule.id, {
        name: newPhaseName,
        startDate: newPhaseStart,
        endDate: newPhaseEnd,
      });
      resetPhaseForm();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to add phase.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ActivityIndicator size="small" style={s.loader} />;
  }

  return (
    <View style={s.phasesSection}>
      {phases.length === 0 && !addingPhase && (
        <AppText variant="caption" style={s.emptyHint}>
          {isManager
            ? "No phases yet. Add one below."
            : "No phases in this schedule."}
        </AppText>
      )}

      {phases.map((p) => (
        <PhaseRow
          key={p.id}
          phase={p}
          siteId={siteId}
          onUpdate={updatePhase}
          onDelete={deletePhase}
          isManager={isManager}
        />
      ))}

      {isManager &&
        (addingPhase ? (
          <View style={s.inlineForm}>
            <ThemedTextInput
              label="Phase name"
              value={newPhaseName}
              onChangeText={setNewPhaseName}
              placeholder="e.g., Site Preparation"
              autoFocus
            />
            <View style={s.dateRow}>
              <View style={s.dateField}>
                <ThemedTextInput
                  label="Start date"
                  value={newPhaseStart}
                  onChangeText={setNewPhaseStart}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={s.dateSpacer} />
              <View style={s.dateField}>
                <ThemedTextInput
                  label="End date"
                  value={newPhaseEnd}
                  onChangeText={setNewPhaseEnd}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
            <View style={s.inlineActions}>
              <Button
                title="Save Phase"
                variant="primary"
                size="sm"
                onPress={handleAddPhase}
                loading={saving}
              />
              <Button
                title="Cancel"
                variant="secondary"
                size="sm"
                onPress={resetPhaseForm}
                disabled={saving}
              />
            </View>
          </View>
        ) : (
          <Button
            title="+ Add Phase"
            variant="secondary"
            size="sm"
            onPress={() => setAddingPhase(true)}
            style={s.addSubBtn}
          />
        ))}
    </View>
  );
}

// ─── ScheduleCard ─────────────────────────────────────────────────────────────

function ScheduleCard({ schedule, siteId, onUpdate, onDelete, isManager }) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(schedule.name);

  function commitNameEdit() {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== schedule.name) {
      onUpdate(schedule.id, { name: trimmed });
    } else {
      setNameVal(schedule.name);
    }
    setEditingName(false);
  }

  function confirmDelete() {
    Alert.alert(
      "Delete Schedule",
      `Delete "${schedule.name}" and all its phases and tasks?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(schedule.id),
        },
      ]
    );
  }

  return (
    <Card style={s.scheduleCard}>
      <View style={s.scheduleHeader}>
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={s.scheduleToggle}
          hitSlop={4}
        >
          <AppText variant="body" bold style={s.scheduleArrow}>
            {expanded ? "▼" : "▶"}
          </AppText>
        </Pressable>

        <View style={s.scheduleNameBlock}>
          {editingName ? (
            <ThemedTextInput
              value={nameVal}
              onChangeText={setNameVal}
              onBlur={commitNameEdit}
              onSubmitEditing={commitNameEdit}
              autoFocus
              style={s.scheduleNameInput}
              inputStyle={{ minHeight: 38 }}
              returnKeyType="done"
            />
          ) : (
            <Pressable onPress={() => isManager && setEditingName(true)}>
              <AppText variant="body" bold>
                {schedule.name}
              </AppText>
            </Pressable>
          )}
        </View>

        {isManager && (
          <Pressable
            onPress={confirmDelete}
            hitSlop={10}
            style={s.rowDeleteBtn}
          >
            <AppText variant="caption" style={s.rowDeleteIcon}>
              ✕
            </AppText>
          </Pressable>
        )}
      </View>

      {expanded && (
        <SchedulePhasesSection
          schedule={schedule}
          siteId={siteId}
          isManager={isManager}
        />
      )}
    </Card>
  );
}

// ─── AdHocTasksSection ────────────────────────────────────────────────────────

function AdHocTasksSection({ siteId, isManager }) {
  const { tasks, loading, addTask, updateTask, deleteTask } = usePhaseTasks(
    null,
    siteId
  );
  const [expanded, setExpanded] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAddTask() {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addTask(trimmed);
      setNewTaskTitle("");
      setAddingTask(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to add task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card style={s.adhocCard}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={s.scheduleHeader}
      >
        <AppText variant="body" bold style={s.scheduleArrow}>
          {expanded ? "▼" : "▶"}
        </AppText>
        <View style={s.scheduleNameBlock}>
          <AppText variant="body" bold>
            Unscheduled Tasks
          </AppText>
          <AppText variant="caption" style={s.adhocCaption}>
            Not linked to any phase
          </AppText>
        </View>
        {!loading && (
          <View style={s.taskCountPill}>
            <AppText variant="caption" bold style={s.taskCountText}>
              {tasks.length}
            </AppText>
          </View>
        )}
      </Pressable>

      {expanded && (
        <View style={s.phasesSection}>
          {loading ? (
            <ActivityIndicator size="small" style={s.loader} />
          ) : (
            <>
              {tasks.length === 0 && !addingTask && (
                <AppText variant="caption" style={s.emptyHint}>
                  No unscheduled tasks.
                </AppText>
              )}

              {tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  isManager={isManager}
                />
              ))}

              {isManager &&
                (addingTask ? (
                  <View style={s.inlineForm}>
                    <ThemedTextInput
                      value={newTaskTitle}
                      onChangeText={setNewTaskTitle}
                      placeholder="Task name..."
                      autoFocus
                      onSubmitEditing={handleAddTask}
                      returnKeyType="done"
                      style={s.inlineInput}
                      inputStyle={{ minHeight: 40 }}
                    />
                    <View style={s.inlineActions}>
                      <Button
                        title="Add"
                        variant="primary"
                        size="sm"
                        onPress={handleAddTask}
                        loading={saving}
                      />
                      <Button
                        title="Cancel"
                        variant="secondary"
                        size="sm"
                        onPress={() => {
                          setAddingTask(false);
                          setNewTaskTitle("");
                        }}
                        disabled={saving}
                      />
                    </View>
                  </View>
                ) : (
                  <Button
                    title="+ Add Unscheduled Task"
                    variant="secondary"
                    size="sm"
                    onPress={() => setAddingTask(true)}
                    style={s.addSubBtn}
                  />
                ))}
            </>
          )}
        </View>
      )}
    </Card>
  );
}

// ─── SiteSchedulesScreen ─────────────────────────────────────────────────────

export default function SiteSchedulesScreen() {
  const route = useRoute();
  const { siteId, siteName } = route.params || {};
  const { role } = useAuth();
  const isManager = role === "manager";

  const [addingSchedule, setAddingSchedule] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [saving, setSaving] = useState(false);

  const { schedules, loading, error, addSchedule, updateSchedule, deleteSchedule } =
    useSiteSchedules(siteId);

  async function handleAddSchedule() {
    if (!newScheduleName.trim()) return;
    setSaving(true);
    try {
      await addSchedule(newScheduleName);
      setNewScheduleName("");
      setAddingSchedule(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to create schedule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title" bold style={s.screenTitle}>
          {siteName || "Site"}
        </AppText>
        <AppText variant="caption" style={s.screenSubtitle}>
          SCHEDULES
        </AppText>

        {/* ─ Add Schedule ─ */}
        {isManager &&
          (addingSchedule ? (
            <Card style={s.addCard}>
              <ThemedTextInput
                label="Schedule name"
                value={newScheduleName}
                onChangeText={setNewScheduleName}
                placeholder="e.g., Foundation Schedule"
                autoFocus
                onSubmitEditing={handleAddSchedule}
                returnKeyType="done"
              />
              <View style={s.inlineActions}>
                <Button
                  title="Save"
                  variant="primary"
                  size="sm"
                  onPress={handleAddSchedule}
                  loading={saving}
                />
                <Button
                  title="Cancel"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setAddingSchedule(false);
                    setNewScheduleName("");
                  }}
                  disabled={saving}
                />
              </View>
            </Card>
          ) : (
            <Button
              title="+ New Schedule"
              variant="secondary"
              onPress={() => setAddingSchedule(true)}
              fullWidth
              style={s.newScheduleBtn}
            />
          ))}

        {/* ─ Schedule list ─ */}
        {loading ? (
          <ActivityIndicator style={s.loader} />
        ) : error ? (
          <AppText variant="body" style={s.errorText}>
            {error.message || "Failed to load schedules."}
          </AppText>
        ) : schedules.length === 0 ? (
          <Card style={s.emptyCard}>
            <AppText variant="body" bold style={s.emptyTitle}>
              No schedules yet
            </AppText>
            <AppText variant="caption" style={s.emptyCaption}>
              {isManager
                ? 'Tap "+ New Schedule" to create the first one.'
                : "No schedules have been created for this site."}
            </AppText>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              siteId={siteId}
              onUpdate={updateSchedule}
              onDelete={deleteSchedule}
              isManager={isManager}
            />
          ))
        )}

        {/* ─ Unscheduled tasks ─ */}
        {siteId && <AdHocTasksSection siteId={siteId} isManager={isManager} />}
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  screenTitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  screenSubtitle: {
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 16,
    opacity: 0.6,
  },
  newScheduleBtn: {
    marginBottom: 12,
  },
  addCard: {
    marginBottom: 12,
  },

  // Schedule card
  scheduleCard: {
    marginBottom: 10,
    padding: 14,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scheduleToggle: {
    padding: 2,
  },
  scheduleArrow: {
    width: 16,
    color: colors.textSecondary,
  },
  scheduleNameBlock: {
    flex: 1,
  },
  scheduleNameInput: {
    marginBottom: 0,
  },

  // Phases section
  phasesSection: {
    marginTop: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.neutralBorder,
  },

  // Phase row
  phaseContainer: {
    marginBottom: 6,
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  phaseArrow: {
    width: 14,
    color: colors.textSecondary,
  },
  phaseNameBlock: {
    flex: 1,
  },
  phaseNameInput: {
    marginBottom: 0,
  },
  phaseDates: {
    marginTop: 2,
    opacity: 0.7,
  },

  // Tasks section
  tasksSection: {
    marginTop: 4,
    paddingLeft: 16,
  },

  // Task row
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 8,
  },
  checkboxWrap: {
    padding: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: "#fff",
    lineHeight: 16,
    fontSize: 11,
  },
  taskTitleArea: {
    flex: 1,
  },
  taskDone: {
    textDecorationLine: "line-through",
    opacity: 0.45,
  },
  taskEditInput: {
    flex: 1,
    marginBottom: 0,
  },

  // Shared delete button
  rowDeleteBtn: {
    padding: 4,
  },
  rowDeleteIcon: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 13,
  },

  // Add sub-item button (phase / task)
  addSubBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
  },

  // Inline form (add task / add phase)
  inlineForm: {
    marginTop: 6,
  },
  inlineInput: {
    marginBottom: 0,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 6,
  },

  // Phase form date row
  dateRow: {
    flexDirection: "row",
  },
  dateField: {
    flex: 1,
  },
  dateSpacer: {
    width: 10,
  },

  // Ad-hoc card
  adhocCard: {
    marginTop: 6,
    marginBottom: 10,
    padding: 14,
    borderStyle: "dashed",
  },
  adhocCaption: {
    marginTop: 1,
    opacity: 0.6,
  },
  taskCountPill: {
    backgroundColor: colors.neutralBorder,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  taskCountText: {
    color: colors.text,
  },

  // Empty / error states
  emptyCard: {
    marginTop: 8,
    marginBottom: 10,
    alignItems: "center",
    paddingVertical: 28,
  },
  emptyTitle: {
    marginBottom: 6,
  },
  emptyCaption: {
    textAlign: "center",
    opacity: 0.7,
  },
  emptyHint: {
    opacity: 0.55,
    paddingVertical: 4,
    fontStyle: "italic",
  },
  errorText: {
    color: colors.accent,
    marginTop: 12,
  },
  loader: {
    marginTop: 24,
  },
});
