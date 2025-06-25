import React from "react";
import { View, StyleSheet, Text } from "react-native";

interface ProgressBarProps {
  progress: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  negativeColor?: string;
  showPercentage?: boolean;
  style?: any;
}

/**
 * ProgressBar component hiển thị thanh tiến độ theo phần trăm
 * Hỗ trợ hiển thị tiến độ âm với màu sắc khác
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 16,
  backgroundColor = "#F1F5F9",
  progressColor = "#00D09E",
  negativeColor = "#EF4444",
  showPercentage = true,
  style,
}) => {
  // Giới hạn giá trị tiến độ từ -100% đến 100%
  const clampedProgress = Math.max(-100, Math.min(100, progress));

  // Màu sắc dựa vào tiến độ
  const barColor = clampedProgress >= 0 ? progressColor : negativeColor;

  // Chiều rộng thanh tiến độ
  const progressWidth = `${Math.abs(clampedProgress)}%`;

  // Căn chỉnh thanh tiến độ khi có giá trị âm
  const alignSelf = clampedProgress >= 0 ? "flex-start" : "flex-end";

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progressBackground, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: progressWidth,
              backgroundColor: barColor,
              alignSelf,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressText}>
          {Math.abs(Math.round(clampedProgress))}%{" "}
          {clampedProgress < 0 ? "overspent" : "of your goal"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  progressBackground: {
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
});

export default ProgressBar;
