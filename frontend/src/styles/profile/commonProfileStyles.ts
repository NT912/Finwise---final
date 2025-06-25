import { StyleSheet } from "react-native";

const commonProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  // Style mới cho header đẹp
  enhancedHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 10,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 200, 151, 0.1)",
  },
  enhancedBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 200, 151, 0.1)",
  },
  enhancedHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginLeft: 15,
    letterSpacing: 0.5,
  },
  section: {
    padding: 20,
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    color: "#333",
  },
  button: {
    backgroundColor: "#00C897",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDanger: {
    backgroundColor: "#FF6B6B",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: "#666",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  // Thêm các style mới vào commonProfileStyles
  methodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    marginHorizontal: 5,
  },
  methodOptionSelected: {
    borderColor: "#00C897",
    backgroundColor: "rgba(0, 200, 151, 0.1)",
  },
  methodText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  methodTextSelected: {
    color: "#00C897",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#00C897",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default commonProfileStyles;
