import { StyleSheet } from "react-native";

const profileHeaderStyles = StyleSheet.create({
  header: {
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  userId: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default profileHeaderStyles;
