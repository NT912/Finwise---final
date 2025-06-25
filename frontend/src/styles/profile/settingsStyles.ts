import { StyleSheet } from "react-native";

const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#333",
  },
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
  dangerText: {
    color: "#FF6B6B",
  },
});

export default settingsStyles;
