import { StyleSheet } from "react-native";

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  editButton: {
    backgroundColor: "#00C897",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
    color: "#333",
  },
  logoutItem: {
    marginTop: 20,
  },
  logoutText: {
    color: "#FF6B6B",
  },
  chevron: {
    marginLeft: "auto",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
  },
  activeTabItem: {
    borderBottomColor: "#00C897",
  },
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default profileStyles;
