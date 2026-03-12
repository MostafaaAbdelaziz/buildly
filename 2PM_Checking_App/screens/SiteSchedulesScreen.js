import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import ThemedTextInput from "../components/ThemedTextInput";
import DatePickerInput from "../components/DatePickerInput";
import { colors } from "../constants/theme";
import { useSiteSchedules } from "../hooks/useSiteSchedules";
import { useSchedulePhases } from "../hooks/useSchedulePhases";
import { usePhaseTasks } from "../hooks/usePhaseTasks";
import { usePhaseTemplates } from "../hooks/usePhaseTemplates";
import { useAuth } from "../context/AuthContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "BLOCKED", "DONE"];

const STATUS_STYLE = {
  PENDING:     { label: "Pending",     color: colors.textSecondary, bg: colors.neutralBorder },
  IN_PROGRESS: { label: "In Progress", color: colors.primary,       bg: "#dbeafe" },
  BLOCKED:     { label: "Blocked",     color: colors.accent,        bg: "#fee2e2" },
  DONE:        { label: "Done",        color: "#15803d",            bg: "#dcfce7" },
};

function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function formatTimestamp(ts) {
  if (!ts) return null;
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return null;
  }
}

// Derive phase date range from its tasks
function derivePhaseDates(tasks) {
  const starts = tasks.map((t) => t.startDate).filter(Boolean).sort();
  const ends   = tasks.map((t) => t.endDate).filter(Boolean).sort();
  const start  = starts[0] || null;
  const end    = ends[ends.length - 1] || null;
  if (!start && !end) return null;
  return `${formatDate(start) || "—"}  →  ${formatDate(end) || "—"}`;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_STYLE[status] || STATUS_STYLE.PENDING;
  return (
    <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
      <AppText variant="caption" bold style={[s.statusBadgeText, { color: cfg.color }]}>
        {cfg.label}
      </AppText>
    </View>
  );
}

// ─── StatusPicker ─────────────────────────────────────────────────────────────

function StatusPicker({ value, onChange }) {
  return (
    <View style={s.statusPicker}>
      {STATUS_OPTIONS.map((opt) => {
        const cfg = STATUS_STYLE[opt];
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              s.statusChip,
              { borderColor: cfg.color, backgroundColor: active ? cfg.bg : "#fff" },
            ]}
          >
            <AppText
              variant="caption"
              bold
              style={{ color: active ? cfg.color : colors.textSecondary }}
            >
              {cfg.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── AddTaskForm ──────────────────────────────────────────────────────────────

function AddTaskForm({ onSave, onCancel }) {
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [status, setStatus]         = useState("PENDING");
  const [assignedTo, setAssignedTo] = useState("");
  const [showMore, setShowMore]     = useState(false);
  const [saving, setSaving]         = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({ title, description, startDate, endDate, status, assignedTo });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={s.addTaskForm}>
      <ThemedTextInput
        label="Task title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Clear brush and debris"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={showMore ? undefined : handleSave}
      />

      <Pressable onPress={() => setShowMore((v) => !v)} style={s.moreToggle}>
        <AppText variant="caption" style={s.moreToggleText}>
          {showMore ? "▼  Hide details" : "▶  Add details (dates, status, notes)"}
        </AppText>
      </Pressable>

      {showMore && (
        <View style={s.moreFields}>
          <ThemedTextInput
            label="Description (optional)"
            value={description}
            onChangeText={setDesc}
            placeholder="Short note about this task..."
            multiline
            inputStyle={{ minHeight: 72, textAlignVertical: "top" }}
          />

          <View style={s.dateRow}>
            <View style={s.dateField}>
              <DatePickerInput
                label="Start date"
                value={startDate}
                onChange={setStartDate}
                placeholder="Pick start date"
              />
            </View>
            <View style={s.dateSpacer} />
            <View style={s.dateField}>
              <DatePickerInput
                label="End date"
                value={endDate}
                onChange={setEndDate}
                placeholder="Pick end date"
              />
            </View>
          </View>

          <AppText variant="body" bold style={s.fieldLabel}>
            Status
          </AppText>
          <StatusPicker value={status} onChange={setStatus} />

          <ThemedTextInput
            label="Assigned to (optional)"
            value={assignedTo}
            onChangeText={setAssignedTo}
            placeholder="Name or email"
            style={s.lastField}
          />
        </View>
      )}

      <View style={s.inlineActions}>
        <Button title="Save Task" variant="primary" size="sm" onPress={handleSave} loading={saving} />
        <Button title="Cancel"    variant="secondary" size="sm" onPress={onCancel} disabled={saving} />
      </View>
    </View>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onUpdate, onDelete, isManager }) {
  const [expanded, setExpanded]   = useState(false);
  const [editing, setEditing]     = useState(false);
  const [title, setTitle]         = useState(task.title);
  const [description, setDesc]    = useState(task.description || "");
  const [startDate, setStartDate] = useState(task.startDate || "");
  const [endDate, setEndDate]     = useState(task.endDate || "");
  const [status, setStatus]       = useState(task.status || "PENDING");
  const [assignedTo, setAssigned] = useState(task.assignedTo || "");
  const [saving, setSaving]       = useState(false);

  const isDone = task.status === "DONE";

  // Keep local state in sync if Firestore pushes updates
  React.useEffect(() => {
    if (!editing) {
      setTitle(task.title);
      setDesc(task.description || "");
      setStartDate(task.startDate || "");
      setEndDate(task.endDate || "");
      setStatus(task.status || "PENDING");
      setAssigned(task.assignedTo || "");
    }
  }, [task, editing]);

  function toggleDone() {
    if (!isManager) return;
    onUpdate(task.id, { status: isDone ? "PENDING" : "DONE" });
  }

  function confirmDelete() {
    Alert.alert("Delete Task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(task.id) },
    ]);
  }

  async function handleSaveEdit() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        startDate: startDate || null,
        endDate: endDate || null,
        status,
        assignedTo: assignedTo.trim() || null,
      });
      setEditing(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  }

  const dateRange = task.startDate || task.endDate
    ? `${formatDate(task.startDate) || "—"}  →  ${formatDate(task.endDate) || "—"}`
    : null;

  return (
    <View style={s.taskCard}>
      {/* ─ Compact row ─ */}
      <View style={s.taskRow}>
        <Pressable onPress={toggleDone} hitSlop={4} style={s.checkboxWrap}>
          <View style={[s.checkbox, isDone && s.checkboxDone]}>
            {isDone && <AppText variant="caption" bold style={s.checkmark}>✓</AppText>}
          </View>
        </Pressable>

        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={s.taskTitleArea}
        >
          <AppText variant="body" style={isDone ? s.taskDone : undefined}>
            {task.title}
          </AppText>
          <View style={s.taskMeta}>
            {task.status && task.status !== "PENDING" && (
              <StatusBadge status={task.status} />
            )}
            {dateRange && (
              <AppText variant="caption" style={s.taskDateHint}>{dateRange}</AppText>
            )}
          </View>
        </Pressable>

        {isManager && (
          <Pressable onPress={confirmDelete} hitSlop={10} style={s.rowDeleteBtn}>
            <AppText variant="caption" style={s.rowDeleteIcon}>✕</AppText>
          </Pressable>
        )}
      </View>

      {/* ─ Expanded detail / edit ─ */}
      {expanded && !editing && (
        <View style={s.taskDetail}>
          {task.description ? (
            <AppText variant="body" style={s.taskDetailDesc}>{task.description}</AppText>
          ) : null}

          {dateRange && (
            <View style={s.taskDetailRow}>
              <AppText variant="caption" style={s.taskDetailLabel}>Dates</AppText>
              <AppText variant="body">{dateRange}</AppText>
            </View>
          )}

          {task.assignedTo ? (
            <View style={s.taskDetailRow}>
              <AppText variant="caption" style={s.taskDetailLabel}>Assigned</AppText>
              <AppText variant="body">{task.assignedTo}</AppText>
            </View>
          ) : null}

          <View style={s.taskDetailRow}>
            <AppText variant="caption" style={s.taskDetailLabel}>Status</AppText>
            <StatusBadge status={task.status || "PENDING"} />
          </View>

          {task.createdAt ? (
            <View style={s.taskDetailRow}>
              <AppText variant="caption" style={s.taskDetailLabel}>Created</AppText>
              <AppText variant="caption">{formatTimestamp(task.createdAt)}</AppText>
            </View>
          ) : null}

          {isManager && (
            <Button
              title="Edit Task"
              variant="secondary"
              size="sm"
              onPress={() => setEditing(true)}
              style={s.editTaskBtn}
            />
          )}
        </View>
      )}

      {expanded && editing && (
        <View style={s.taskDetail}>
          <ThemedTextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <ThemedTextInput
            label="Description"
            value={description}
            onChangeText={setDesc}
            placeholder="Short note..."
            multiline
            inputStyle={{ minHeight: 72, textAlignVertical: "top" }}
          />
          <View style={s.dateRow}>
            <View style={s.dateField}>
              <DatePickerInput label="Start date" value={startDate} onChange={setStartDate} />
            </View>
            <View style={s.dateSpacer} />
            <View style={s.dateField}>
              <DatePickerInput label="End date" value={endDate} onChange={setEndDate} />
            </View>
          </View>
          <AppText variant="body" bold style={s.fieldLabel}>Status</AppText>
          <StatusPicker value={status} onChange={setStatus} />
          <ThemedTextInput
            label="Assigned to"
            value={assignedTo}
            onChangeText={setAssigned}
            placeholder="Name or email"
            style={s.lastField}
          />
          <View style={s.inlineActions}>
            <Button title="Save" variant="primary" size="sm" onPress={handleSaveEdit} loading={saving} />
            <Button
              title="Cancel"
              variant="secondary"
              size="sm"
              onPress={() => { setEditing(false); }}
              disabled={saving}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ─── TemplatePicker ───────────────────────────────────────────────────────────

function TemplatePicker({ visible, onClose, onSelect }) {
  const { templates, loading, fetchTemplates } = usePhaseTemplates();

  React.useEffect(() => {
    if (visible) fetchTemplates();
  }, [visible, fetchTemplates]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.templateBackdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={s.templateSheet}>
              <View style={s.templateSheetHeader}>
                <AppText variant="title" bold style={s.templateSheetTitle}>
                  APPLY TEMPLATE
                </AppText>
                <Pressable onPress={onClose} hitSlop={8}>
                  <AppText variant="body" bold style={s.templateSheetClose}>✕</AppText>
                </Pressable>
              </View>

              {loading ? (
                <ActivityIndicator style={s.loader} />
              ) : templates.length === 0 ? (
                <AppText variant="body" style={s.emptyHint}>
                  No templates yet. Save a phase as a template first.
                </AppText>
              ) : (
                templates.map((tmpl) => (
                  <Pressable
                    key={tmpl.id}
                    onPress={() => onSelect(tmpl)}
                    style={s.templateItem}
                  >
                    <AppText variant="body" bold>{tmpl.name}</AppText>
                    <AppText variant="caption" style={s.templateItemSub}>
                      {tmpl.tasks?.length || 0} task{(tmpl.tasks?.length || 0) !== 1 ? "s" : ""}
                      {tmpl.isPublic ? "  ·  Shared" : "  ·  Private"}
                    </AppText>
                  </Pressable>
                ))
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── PhaseRow ─────────────────────────────────────────────────────────────────

function PhaseRow({ phase, siteId, onUpdate, onDelete, isManager }) {
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask } =
    usePhaseTasks(phase.id, siteId);

  const [expanded, setExpanded]       = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal]         = useState(phase.name);
  const [addingTask, setAddingTask]   = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName]     = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [isPublicTemplate, setIsPublicTemplate] = useState(false);

  const { saveTemplate } = usePhaseTemplates();

  const derivedDates = derivePhaseDates(tasks);

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
      `Delete "${phase.name}" and all its tasks?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(phase.id) },
      ]
    );
  }

  async function handleSaveAsTemplate() {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    try {
      await saveTemplate(templateName, tasks, isPublicTemplate);
      setShowSaveTemplate(false);
      setTemplateName("");
      Alert.alert("Saved", `Template "${templateName}" saved successfully.`);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save template.");
    } finally {
      setSavingTemplate(false);
    }
  }

  const doneTasks    = tasks.filter((t) => t.status === "DONE").length;
  const progressText = tasks.length > 0 ? `${doneTasks}/${tasks.length}` : null;

  return (
    <View style={s.phaseContainer}>
      {/* ─ Phase header ─ */}
      <Pressable onPress={() => setExpanded((v) => !v)} style={s.phaseHeader}>
        <AppText variant="caption" style={s.phaseArrow}>{expanded ? "▼" : "▶"}</AppText>

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
              <AppText variant="body" bold>{phase.name}</AppText>
              {derivedDates && (
                <AppText variant="caption" style={s.phaseDates}>{derivedDates}</AppText>
              )}
            </Pressable>
          )}
        </View>

        {progressText && (
          <View style={s.taskCountPill}>
            <AppText variant="caption" bold style={s.taskCountText}>{progressText}</AppText>
          </View>
        )}

        {isManager && (
          <Pressable onPress={confirmDelete} hitSlop={10} style={s.rowDeleteBtn}>
            <AppText variant="caption" style={s.rowDeleteIcon}>✕</AppText>
          </Pressable>
        )}
      </Pressable>

      {/* ─ Expanded body ─ */}
      {expanded && (
        <View style={s.tasksSection}>
          {tasksLoading ? (
            <ActivityIndicator size="small" style={s.loader} />
          ) : (
            <>
              {tasks.length === 0 && !addingTask && (
                <AppText variant="caption" style={s.emptyHint}>No tasks yet.</AppText>
              )}

              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  isManager={isManager}
                />
              ))}

              {isManager && (
                addingTask ? (
                  <AddTaskForm
                    onSave={async (taskData) => {
                      await addTask(taskData);
                      setAddingTask(false);
                    }}
                    onCancel={() => setAddingTask(false)}
                  />
                ) : (
                  <Button
                    title="+ Add Task"
                    variant="secondary"
                    size="sm"
                    onPress={() => setAddingTask(true)}
                    style={s.addSubBtn}
                  />
                )
              )}

              {/* ─ Save as Template ─ */}
              {isManager && tasks.length > 0 && (
                showSaveTemplate ? (
                  <View style={s.templateSaveForm}>
                    <ThemedTextInput
                      label="Template name"
                      value={templateName}
                      onChangeText={setTemplateName}
                      placeholder={phase.name}
                      autoFocus
                    />
                    <Pressable
                      onPress={() => setIsPublicTemplate((v) => !v)}
                      style={s.publicToggleRow}
                    >
                      <View style={[s.publicToggleBox, isPublicTemplate && s.publicToggleBoxOn]} />
                      <AppText variant="caption" style={s.publicToggleLabel}>
                        Share with all users
                      </AppText>
                    </Pressable>
                    <View style={s.inlineActions}>
                      <Button
                        title="Save Template"
                        variant="primary"
                        size="sm"
                        onPress={handleSaveAsTemplate}
                        loading={savingTemplate}
                      />
                      <Button
                        title="Cancel"
                        variant="secondary"
                        size="sm"
                        onPress={() => { setShowSaveTemplate(false); setTemplateName(""); }}
                        disabled={savingTemplate}
                      />
                    </View>
                  </View>
                ) : (
                  <Button
                    title="Save Phase as Template"
                    variant="secondary"
                    size="sm"
                    onPress={() => { setTemplateName(phase.name); setShowSaveTemplate(true); }}
                    style={s.templateSaveBtn}
                  />
                )
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ─── SchedulePhasesSection ────────────────────────────────────────────────────

function SchedulePhasesSection({ schedule, siteId, isManager }) {
  const { phases, loading, addPhase, updatePhase, deletePhase } =
    useSchedulePhases(schedule.id);
  const { fetchTemplates, templates, loading: tmplLoading } = usePhaseTemplates();

  const [addingPhase, setAddingPhase]         = useState(false);
  const [newPhaseName, setNewPhaseName]       = useState("");
  const [newPhaseDesc, setNewPhaseDesc]       = useState("");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [saving, setSaving]                   = useState(false);

  function resetPhaseForm() {
    setAddingPhase(false);
    setNewPhaseName("");
    setNewPhaseDesc("");
  }

  async function handleAddPhase() {
    if (!newPhaseName.trim()) return;
    setSaving(true);
    try {
      await addPhase(schedule.id, { name: newPhaseName, description: newPhaseDesc });
      resetPhaseForm();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to add phase.");
    } finally {
      setSaving(false);
    }
  }

  // Apply a template: create the phase, then create all template tasks
  async function handleApplyTemplate(template, { addTask }) {
    setSaving(true);
    try {
      await addPhase(schedule.id, { name: template.name });
      // Tasks will be created under the new phase, but we need the phaseId —
      // this is handled by usePhaseTasks in PhaseRow once the phase is created.
      // For now, just create the phase; users can add tasks manually or
      // we extend this once we have the new phase id back.
      // Note: Firestore addDoc returns the ref, but our hook doesn't return it.
      // This is a known limitation - see TODO in useSchedulePhases.
      setShowTemplatePicker(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to apply template.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ActivityIndicator size="small" style={s.loader} />;

  return (
    <View style={s.phasesSection}>
      {phases.length === 0 && !addingPhase && (
        <AppText variant="caption" style={s.emptyHint}>
          {isManager ? "No phases yet. Add one below." : "No phases in this schedule."}
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

      {isManager && (
        addingPhase ? (
          <View style={s.inlineForm}>
            <ThemedTextInput
              label="Phase name"
              value={newPhaseName}
              onChangeText={setNewPhaseName}
              placeholder="e.g., Site Preparation"
              autoFocus
            />
            <ThemedTextInput
              label="Description (optional)"
              value={newPhaseDesc}
              onChangeText={setNewPhaseDesc}
              placeholder="Brief description..."
              multiline
              inputStyle={{ minHeight: 60, textAlignVertical: "top" }}
            />
            <View style={s.inlineActions}>
              <Button title="Save Phase" variant="primary" size="sm" onPress={handleAddPhase} loading={saving} />
              <Button title="Cancel" variant="secondary" size="sm" onPress={resetPhaseForm} disabled={saving} />
            </View>
          </View>
        ) : (
          <View style={s.addPhaseRow}>
            <Button
              title="+ Add Phase"
              variant="secondary"
              size="sm"
              onPress={() => setAddingPhase(true)}
              style={s.addSubBtn}
            />
            <Button
              title="From Template"
              variant="secondary"
              size="sm"
              onPress={() => setShowTemplatePicker(true)}
              style={s.addSubBtn}
            />
          </View>
        )
      )}

      <TemplatePicker
        visible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={(tmpl) => handleApplyTemplate(tmpl, {})}
      />
    </View>
  );
}

// ─── ScheduleCard ─────────────────────────────────────────────────────────────

function ScheduleCard({ schedule, siteId, onUpdate, onDelete, isManager }) {
  const [expanded, setExpanded]       = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal]         = useState(schedule.name);

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
        { text: "Delete", style: "destructive", onPress: () => onDelete(schedule.id) },
      ]
    );
  }

  return (
    <Card style={s.scheduleCard}>
      <View style={s.scheduleHeader}>
        <Pressable onPress={() => setExpanded((v) => !v)} style={s.scheduleToggle} hitSlop={4}>
          <AppText variant="body" bold style={s.scheduleArrow}>{expanded ? "▼" : "▶"}</AppText>
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
              <AppText variant="body" bold>{schedule.name}</AppText>
            </Pressable>
          )}
        </View>

        {isManager && (
          <Pressable onPress={confirmDelete} hitSlop={10} style={s.rowDeleteBtn}>
            <AppText variant="caption" style={s.rowDeleteIcon}>✕</AppText>
          </Pressable>
        )}
      </View>

      {expanded && (
        <SchedulePhasesSection schedule={schedule} siteId={siteId} isManager={isManager} />
      )}
    </Card>
  );
}

// ─── AdHocTasksSection ────────────────────────────────────────────────────────

function AdHocTasksSection({ siteId, isManager }) {
  const { tasks, loading, addTask, updateTask, deleteTask } = usePhaseTasks(null, siteId);
  const [expanded, setExpanded]   = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  return (
    <Card style={s.adhocCard}>
      <Pressable onPress={() => setExpanded((v) => !v)} style={s.scheduleHeader}>
        <AppText variant="body" bold style={s.scheduleArrow}>{expanded ? "▼" : "▶"}</AppText>
        <View style={s.scheduleNameBlock}>
          <AppText variant="body" bold>Unscheduled Tasks</AppText>
          <AppText variant="caption" style={s.adhocCaption}>Not linked to any phase</AppText>
        </View>
        {!loading && (
          <View style={s.taskCountPill}>
            <AppText variant="caption" bold style={s.taskCountText}>{tasks.length}</AppText>
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
                <AppText variant="caption" style={s.emptyHint}>No unscheduled tasks.</AppText>
              )}

              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  isManager={isManager}
                />
              ))}

              {isManager && (
                addingTask ? (
                  <AddTaskForm
                    onSave={async (taskData) => {
                      await addTask(taskData);
                      setAddingTask(false);
                    }}
                    onCancel={() => setAddingTask(false)}
                  />
                ) : (
                  <Button
                    title="+ Add Unscheduled Task"
                    variant="secondary"
                    size="sm"
                    onPress={() => setAddingTask(true)}
                    style={s.addSubBtn}
                  />
                )
              )}
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
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <AppText variant="title" bold style={s.screenTitle}>{siteName || "Site"}</AppText>
        <AppText variant="caption" style={s.screenSubtitle}>SCHEDULES</AppText>

        {isManager && (
          addingSchedule ? (
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
                <Button title="Save" variant="primary" size="sm" onPress={handleAddSchedule} loading={saving} />
                <Button
                  title="Cancel"
                  variant="secondary"
                  size="sm"
                  onPress={() => { setAddingSchedule(false); setNewScheduleName(""); }}
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
          )
        )}

        {loading ? (
          <ActivityIndicator style={s.loader} />
        ) : error ? (
          <AppText variant="body" style={s.errorText}>
            {error.message || "Failed to load schedules."}
          </AppText>
        ) : schedules.length === 0 ? (
          <Card style={s.emptyCard}>
            <AppText variant="body" bold style={s.emptyTitle}>No schedules yet</AppText>
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

        {siteId && <AdHocTasksSection siteId={siteId} isManager={isManager} />}
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:      { paddingBottom: 40 },
  screenTitle:    { textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  screenSubtitle: { textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, opacity: 0.6 },
  newScheduleBtn: { marginBottom: 12 },
  addCard:        { marginBottom: 12 },

  // Schedule card
  scheduleCard:      { marginBottom: 10, padding: 14 },
  scheduleHeader:    { flexDirection: "row", alignItems: "center", gap: 10 },
  scheduleToggle:    { padding: 2 },
  scheduleArrow:     { width: 16, color: colors.textSecondary },
  scheduleNameBlock: { flex: 1 },
  scheduleNameInput: { marginBottom: 0 },

  // Phases section
  phasesSection: {
    marginTop: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.neutralBorder,
  },

  // Phase row
  phaseContainer: { marginBottom: 6 },
  phaseHeader:    { flexDirection: "row", alignItems: "center", paddingVertical: 6, gap: 8 },
  phaseArrow:     { width: 14, color: colors.textSecondary },
  phaseNameBlock: { flex: 1 },
  phaseNameInput: { marginBottom: 0 },
  phaseDates:     { marginTop: 2, opacity: 0.7 },

  // Tasks section (inside phase)
  tasksSection: { marginTop: 4, paddingLeft: 16 },

  // Task card
  taskCard:     { marginBottom: 2 },
  taskRow:      { flexDirection: "row", alignItems: "center", paddingVertical: 5, gap: 8 },
  checkboxWrap: { padding: 2 },
  checkbox: {
    width: 20, height: 20,
    borderWidth: 2, borderColor: colors.text,
    borderRadius: 4, alignItems: "center", justifyContent: "center",
  },
  checkboxDone:  { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark:     { color: "#fff", lineHeight: 16, fontSize: 11 },
  taskTitleArea: { flex: 1 },
  taskDone:      { textDecorationLine: "line-through", opacity: 0.45 },
  taskMeta:      { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  taskDateHint:  { opacity: 0.6, fontSize: 11 },

  // Task detail expansion
  taskDetail: {
    marginLeft: 28,
    marginBottom: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.neutralBorder,
  },
  taskDetailDesc:  { marginBottom: 8, opacity: 0.8 },
  taskDetailRow:   { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 6 },
  taskDetailLabel: { width: 60, opacity: 0.55 },
  editTaskBtn:     { marginTop: 8, alignSelf: "flex-start" },

  // Status badge
  statusBadge:     { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" },
  statusBadgeText: { fontSize: 11 },

  // Status picker chips
  statusPicker: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  statusChip: {
    borderWidth: 1.5, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4,
  },

  // Add task form
  addTaskForm: { marginTop: 6, marginBottom: 8 },
  moreToggle:     { paddingVertical: 6, marginBottom: 4 },
  moreToggleText: { color: colors.primary, fontWeight: "700" },
  moreFields:     { marginTop: 4 },
  fieldLabel: {
    marginBottom: 8, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 1,
    fontSize: 12, opacity: 0.8,
  },
  lastField: { marginBottom: 0 },

  // Shared
  rowDeleteBtn:  { padding: 4 },
  rowDeleteIcon: { color: colors.accent, fontWeight: "800", fontSize: 13 },
  addSubBtn:     { marginTop: 4, alignSelf: "flex-start" },
  addPhaseRow:   { flexDirection: "row", gap: 8, flexWrap: "wrap" },

  inlineForm:    { marginTop: 6 },
  inlineActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 6 },

  dateRow:    { flexDirection: "row" },
  dateField:  { flex: 1 },
  dateSpacer: { width: 10 },

  taskCountPill:  { backgroundColor: colors.neutralBorder, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  taskCountText:  { color: colors.text },

  // Template save form (inside phase)
  templateSaveForm: { marginTop: 10, padding: 10, backgroundColor: colors.neutral, borderRadius: 8 },
  templateSaveBtn:  { marginTop: 8, alignSelf: "flex-start" },
  publicToggleRow:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  publicToggleBox:  { width: 18, height: 18, borderWidth: 2, borderColor: colors.text, borderRadius: 3 },
  publicToggleBoxOn:{ backgroundColor: colors.primary, borderColor: colors.primary },
  publicToggleLabel:{ opacity: 0.7 },

  // Template picker modal
  templateBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  templateSheet: {
    backgroundColor: "#fff",
    borderTopWidth: 3, borderTopColor: "#111",
    padding: 20,
    maxHeight: "70%",
  },
  templateSheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  templateSheetTitle:  { letterSpacing: 1 },
  templateSheetClose:  { color: colors.accent },
  templateItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralBorder,
  },
  templateItemSub: { marginTop: 2, opacity: 0.6 },

  // Ad-hoc card
  adhocCard:    { marginTop: 6, marginBottom: 10, padding: 14, borderStyle: "dashed" },
  adhocCaption: { marginTop: 1, opacity: 0.6 },

  // Empty / error states
  emptyCard:    { marginTop: 8, marginBottom: 10, alignItems: "center", paddingVertical: 28 },
  emptyTitle:   { marginBottom: 6 },
  emptyCaption: { textAlign: "center", opacity: 0.7 },
  emptyHint:    { opacity: 0.55, paddingVertical: 4, fontStyle: "italic" },
  errorText:    { color: colors.accent, marginTop: 12 },
  loader:       { marginTop: 24 },
});
