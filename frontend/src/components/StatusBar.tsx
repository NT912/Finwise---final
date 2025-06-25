import React from "react";
import { StatusBar as RNStatusBar, StatusBarStyle } from "react-native";

interface CustomStatusBarProps {
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  barStyle = "dark-content",
  backgroundColor = "#fff",
}) => {
  return (
    <RNStatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent={true}
    />
  );
};

export default CustomStatusBar;
