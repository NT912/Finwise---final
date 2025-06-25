import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import styles from "../styles/home/homeStyles";

interface Props {
  userName: string;
  userAvatar: string;
}

const HeaderSection: React.FC<Props> = ({ userName, userAvatar }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.header}>
      <View style={styles.userSection}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{ uri: userAvatar || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>Hi, Welcome Back</Text>
          <Text style={styles.userName}>{userName || "User"}</Text>
        </View>
      </View>
    </View>
  );
};

export default HeaderSection;
