import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import profileMenuStyles from "../../styles/profile/profileMenuStyles";

interface MenuItem {
  icon: string;
  text: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
}

interface ProfileMenuProps {
  items: MenuItem[];
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ items }) => {
  return (
    <View style={profileMenuStyles.menuContainer}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={profileMenuStyles.menuItem}
          onPress={item.onPress}
        >
          <View
            style={[
              profileMenuStyles.menuIcon,
              { backgroundColor: item.color || "#E3FFF8" },
            ]}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={item.textColor || "#00D09E"}
            />
          </View>
          <Text
            style={[
              profileMenuStyles.menuText,
              item.textColor && { color: item.textColor },
            ]}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ProfileMenu;
