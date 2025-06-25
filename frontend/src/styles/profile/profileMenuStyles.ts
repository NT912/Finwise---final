import { StyleSheet } from "react-native";

const profileMenuStyles = StyleSheet.create({
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3FFF8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
});

export default profileMenuStyles;
