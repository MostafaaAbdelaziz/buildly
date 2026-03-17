import React from "react";
import Svg, { Rect, Circle, Line, Path } from "react-native-svg";

export function DashboardIcon({ color = "#6b7280", size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function IssuesIcon({ color = "#6b7280", size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="16" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function ScheduleIcon({ color = "#6b7280", size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" />
      <Line x1="8" y1="14" x2="16" y2="14" stroke={color} strokeWidth="2" />
      <Line x1="8" y1="17" x2="13" y2="17" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function MapIcon({ color = "#6b7280", size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Map pin shape */}
      <Path
        d="M12 21C12 21 19 14.28 19 9.5C19 6.19 15.87 3 12 3C8.13 3 5 6.19 5 9.5C5 14.28 12 21 12 21Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Hole in the pin */}
      <Circle
        cx="12"
        cy="10"
        r="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </Svg>
  );
}

export function ProfileIcon({ color = "#6b7280", size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <Path d="M4 20 C4 16 8 14 12 14 C16 14 20 16 20 20" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}
