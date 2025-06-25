import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import homeStyles from "../../styles/home/homeStyles";

interface HeaderProps {
  userName: string;
  userAvatar: string;
}

const Header: React.FC<HeaderProps> = ({ userName, userAvatar }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={homeStyles.header}>
      {/* 🔥 Avatar + Tên User */}
      <View style={homeStyles.userSection}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image source={{ uri: userAvatar }} style={homeStyles.avatar} />
        </TouchableOpacity>
        <View>
          <Text style={homeStyles.greeting}>Hi, Welcome Back</Text>
          <Text style={homeStyles.userName}>{userName || "User"}</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;
