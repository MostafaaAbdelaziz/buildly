import React from "react";
import { View, Text } from "react-native";
import { addDays, daysBetween, startOfWeek, formatMonthShort } from "./dateUtils";
import { styles } from "./styles";

export function TimelineHeader({ timelineStart, totalDays, viewMode, dayWidth }) {
  if (viewMode === "Day") {
    return (
      <View style={[styles.timelineHeaderRow, { width: totalDays * dayWidth }]}>
        {Array.from({ length: totalDays }).map((_, i) => {
          const date = addDays(timelineStart, i);
          const day = date.getDate();
          const showMonth = i === 0 || day === 1;
          return (
            <View key={i} style={[styles.headerCell, { width: dayWidth }]}>
              {showMonth ? (
                <Text style={styles.headerMonthText}>
                  {formatMonthShort(date)} {day}
                </Text>
              ) : (
                <Text style={styles.headerDayText}>{day}</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  if (viewMode === "Week") {
    const labels = [];
    let cursor = startOfWeek(timelineStart);
    while (daysBetween(timelineStart, cursor) < totalDays) {
      const offset = Math.max(0, daysBetween(timelineStart, cursor));
      labels.push({ date: new Date(cursor), offset });
      cursor = addDays(cursor, 7);
    }
    return (
      <View style={[styles.timelineHeaderRow, { width: totalDays * dayWidth }]}>
        {labels.map((l, i) => (
          <View
            key={i}
            style={[styles.headerCell, styles.headerCellWeek, { left: l.offset * dayWidth, width: 7 * dayWidth, position: "absolute" }]}
          >
            <Text style={styles.headerMonthText}>
              {formatMonthShort(l.date)} {l.date.getDate()}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  const labels = [];
  let cursor = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
  while (cursor < addDays(timelineStart, totalDays)) {
    const offset = Math.max(0, daysBetween(timelineStart, cursor));
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const span = Math.min(daysBetween(cursor, nextMonth), totalDays - offset);
    labels.push({ date: new Date(cursor), offset, span });
    cursor = nextMonth;
  }
  return (
    <View style={[styles.timelineHeaderRow, { width: totalDays * dayWidth }]}>
      {labels.map((l, i) => (
        <View
          key={i}
          style={[styles.headerCell, styles.headerCellMonth, { left: l.offset * dayWidth, width: l.span * dayWidth, position: "absolute" }]}
        >
          <Text style={styles.headerMonthText}>
            {formatMonthShort(l.date)} {l.date.getFullYear()}
          </Text>
        </View>
      ))}
    </View>
  );
}
