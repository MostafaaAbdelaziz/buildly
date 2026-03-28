import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout } from "../constants/theme";

/**
 * Custom hook to get the bottom padding needed for floating tab bar.
 * Use this in ScrollView contentContainerStyle to prevent content from being hidden.
 *
 * @returns {number} Bottom padding value in pixels
 *
 * @example
 * const tabBarPadding = useTabBarPadding();
 * <ScrollView contentContainerStyle={{ paddingBottom: tabBarPadding }}>
 */
export function useTabBarPadding() {
  const insets = useSafeAreaInsets();
  return layout.floatingTabBarHeight + insets.bottom;
}
