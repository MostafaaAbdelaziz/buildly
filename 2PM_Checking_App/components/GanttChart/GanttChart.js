import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  DEFAULT_DAY_WIDTH,
  ROW_HEIGHT,
  ROW_GAP,
  HEADER_HEIGHT,
  BUFFER_DAYS,
  DAY_WIDTH_MIN,
  DAY_WIDTH_MAX,
  ZOOM_STEP,
  DAYS_PER_VIEW,
} from "./constants";
import { addDays, daysBetween, parseDate } from "./dateUtils";
import { MOCK_TASKS } from "./mockData";
import { ViewSwitcher } from "./ViewSwitcher";
import { TimelineHeader } from "./TimelineHeader";
import { GridLines } from "./GridLines";
import { TodayLine } from "./TodayLine";
import { styles } from "./styles";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GANTT_HEADER_H = 56;

export default function GanttChart({ title = "TIMELINE", tasks = MOCK_TASKS }) {
  const [viewMode, setViewMode] = useState("Day");
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const scrollingSource = useRef(null);
  const didAutoScroll = useRef(false);
  const didApplyInitialFov = useRef(false);
  const scrollXRef = useRef(0);
  const pendingCenterDayRef = useRef(null);

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const { timelineStart, totalDays } = useMemo(() => {
    if (!tasks.length) {
      const start = addDays(today, -BUFFER_DAYS);
      return { timelineStart: start, totalDays: BUFFER_DAYS * 2 };
    }
    let minDate = parseDate(tasks[0].startDate);
    let maxDate = parseDate(tasks[0].endDate);
    for (const t of tasks) {
      const s = parseDate(t.startDate);
      const e = parseDate(t.endDate);
      if (s < minDate) minDate = s;
      if (e > maxDate) maxDate = e;
    }
    const start = addDays(minDate, -BUFFER_DAYS);
    const end = addDays(maxDate, BUFFER_DAYS);
    return { timelineStart: start, totalDays: daysBetween(start, end) };
  }, [tasks, today]);

  const todayOffset = useMemo(() => {
    return daysBetween(timelineStart, today) * dayWidth;
  }, [timelineStart, today, dayWidth]);

  const totalHeight = tasks.length * (ROW_HEIGHT + ROW_GAP);
  const timelineWidth = totalDays * dayWidth;
  const scrollAreaHeight = bodyHeight > 0 ? bodyHeight - GANTT_HEADER_H : 300;

  useEffect(() => {
    if (scrollViewWidth <= 0 || !DAYS_PER_VIEW[viewMode] || didApplyInitialFov.current) return;
    didApplyInitialFov.current = true;
    const target = scrollViewWidth / DAYS_PER_VIEW[viewMode];
    setDayWidth(Math.max(DAY_WIDTH_MIN, Math.min(DAY_WIDTH_MAX, target)));
  }, [scrollViewWidth, viewMode]);

  useEffect(() => {
    if (didAutoScroll.current) return;
    didAutoScroll.current = true;
    const timer = setTimeout(() => {
      horizontalScrollRef.current?.scrollTo({
        x: Math.max(0, todayOffset - 150),
        animated: false,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [todayOffset]);

  const handleCenterToday = useCallback(() => {
    if (scrollViewWidth <= 0) return;
    const x = Math.max(0, todayOffset - scrollViewWidth / 2 + dayWidth / 2);
    horizontalScrollRef.current?.scrollTo({ x, animated: true });
  }, [todayOffset, scrollViewWidth, dayWidth]);

  const applyCenterPreservedScroll = useCallback(() => {
    const centerDay = pendingCenterDayRef.current;
    if (centerDay == null || scrollViewWidth <= 0) return;
    pendingCenterDayRef.current = null;
    const maxScroll = Math.max(0, timelineWidth - scrollViewWidth);
    const x = Math.max(0, Math.min(centerDay * dayWidth - scrollViewWidth / 2, maxScroll));
    requestAnimationFrame(() => {
      horizontalScrollRef.current?.scrollTo({ x, animated: false });
    });
  }, [dayWidth, scrollViewWidth, timelineWidth]);

  useEffect(() => {
    if (pendingCenterDayRef.current == null) return;
    applyCenterPreservedScroll();
  }, [dayWidth, scrollViewWidth, applyCenterPreservedScroll]);

  const handleZoomIn = useCallback(() => {
    if (scrollViewWidth <= 0) return;
    const centerDay = (scrollXRef.current + scrollViewWidth / 2) / dayWidth;
    pendingCenterDayRef.current = centerDay;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDayWidth((w) => Math.min(DAY_WIDTH_MAX, w + ZOOM_STEP));
  }, [dayWidth, scrollViewWidth]);

  const handleZoomOut = useCallback(() => {
    if (scrollViewWidth <= 0) return;
    const centerDay = (scrollXRef.current + scrollViewWidth / 2) / dayWidth;
    pendingCenterDayRef.current = centerDay;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDayWidth((w) => Math.max(DAY_WIDTH_MIN, w - ZOOM_STEP));
  }, [dayWidth, scrollViewWidth]);

  const handleViewChange = useCallback((mode) => {
    if (scrollViewWidth <= 0 || !DAYS_PER_VIEW[mode]) return;
    const centerDay = (scrollXRef.current + scrollViewWidth / 2) / dayWidth;
    pendingCenterDayRef.current = centerDay;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(mode);
    setDayWidth(Math.max(DAY_WIDTH_MIN, Math.min(DAY_WIDTH_MAX, scrollViewWidth / DAYS_PER_VIEW[mode])));
  }, [scrollViewWidth, dayWidth]);

  const syncScroll = useCallback((source, e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (scrollingSource.current && scrollingSource.current !== source) return;
    scrollingSource.current = source;
    if (source === "left") {
      rightScrollRef.current?.scrollTo({ y, animated: false });
    } else {
      leftScrollRef.current?.scrollTo({ y, animated: false });
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    scrollingSource.current = null;
  }, []);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setBodyHeight(e.nativeEvent.layout.height)}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      {bodyHeight > 0 && (
        <View style={styles.body}>
          <View style={[styles.leftPanel, { height: scrollAreaHeight }]}>
            <View style={[styles.leftHeaderSpacer, { height: HEADER_HEIGHT }]} />
            <ScrollView
              ref={leftScrollRef}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(e) => syncScroll("left", e)}
              onMomentumScrollEnd={handleScrollEnd}
              onScrollEndDrag={handleScrollEnd}
              style={{ height: scrollAreaHeight - HEADER_HEIGHT }}
            >
              {tasks.map((task) => (
                <View key={task.id} style={styles.taskNameRow}>
                  <Text style={styles.taskNameText} numberOfLines={1}>
                    {task.name}
                  </Text>
                </View>
              ))}
              <View style={{ height: ROW_GAP }} />
            </ScrollView>
          </View>

          <View style={[styles.rightPanel, { height: scrollAreaHeight }]}>
            <View style={{ flex: 1, position: "relative" }}>
              <ScrollView
                ref={horizontalScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                scrollEventThrottle={16}
                onScroll={(e) => { scrollXRef.current = e.nativeEvent.contentOffset.x; }}
                onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
                style={{ height: scrollAreaHeight }}
              >
                <View style={{ width: timelineWidth }}>
                  <TimelineHeader
                    timelineStart={timelineStart}
                    totalDays={totalDays}
                    viewMode={viewMode}
                    dayWidth={dayWidth}
                  />
                  <ScrollView
                    ref={rightScrollRef}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={(e) => syncScroll("right", e)}
                    onMomentumScrollEnd={handleScrollEnd}
                    onScrollEndDrag={handleScrollEnd}
                    nestedScrollEnabled
                    style={{ height: scrollAreaHeight - HEADER_HEIGHT }}
                  >
                    <View style={[styles.barsContainer, { width: timelineWidth, height: totalHeight + ROW_GAP }]}>
                      <GridLines totalDays={totalDays} totalHeight={totalHeight + ROW_GAP} viewMode={viewMode} dayWidth={dayWidth} />
                      {tasks.map((task, idx) => {
                        const startOffset = daysBetween(timelineStart, parseDate(task.startDate));
                        const duration = daysBetween(parseDate(task.startDate), parseDate(task.endDate));
                        const left = startOffset * dayWidth;
                        const width = Math.max(duration * dayWidth, dayWidth);
                        const top = idx * (ROW_HEIGHT + ROW_GAP) + ROW_GAP / 2;
                        return (
                          <View
                            key={task.id}
                            style={[
                              styles.taskBar,
                              { left, top, width, height: ROW_HEIGHT, backgroundColor: task.color },
                            ]}
                          />
                        );
                      })}
                      {todayOffset >= 0 && todayOffset <= timelineWidth && (
                        <View style={[styles.todayLineContainer, { left: todayOffset, height: totalHeight + ROW_GAP }]}>
                          <TodayLine height={totalHeight + ROW_GAP} />
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </View>
              </ScrollView>

              <View style={styles.switcherFloatTop} pointerEvents="box-none">
                <ViewSwitcher active={viewMode} onChange={handleViewChange} compact />
              </View>

              <View style={styles.floatButtons} pointerEvents="box-none">
                <TouchableOpacity style={[styles.floatButton, styles.floatButtonWide]} onPress={handleCenterToday} activeOpacity={0.8}>
                  <Text style={styles.floatButtonTextSmall}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatButton} onPress={handleZoomOut} activeOpacity={0.8}>
                  <Text style={styles.floatButtonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatButton} onPress={handleZoomIn} activeOpacity={0.8}>
                  <Text style={styles.floatButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
