import React from "react";
import { View, Text, Image } from "react-native";
import profileHeaderStyles from "../../styles/profile/profileHeaderStyles";

interface ProfileHeaderProps {
  userName: string;
  userId: string;
  userAvatar: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName,
  userId,
  userAvatar,
}) => {
  return (
    <View style={profileHeaderStyles.header}>
      <Image
        source={
          userAvatar
            ? { uri: userAvatar }
            : require("../../../assets/user-avatar.png")
        }
        style={profileHeaderStyles.avatar}
      />
      <Text style={profileHeaderStyles.userName}>{userName}</Text>
    </View>
  );
};

export default ProfileHeader;
