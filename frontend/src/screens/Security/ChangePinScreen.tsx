import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ChangePinScreen = () => {
  const navigation = useNavigation();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handlePinChange = (value: string, setter: (value: string) => void) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleChangePin = () => {
    if (!currentPin || !newPin || !confirmPin) {
      setError("Please fill in all PIN fields");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }

    if (newPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    // TODO: Implement PIN change logic here
    console.log("PIN changed successfully");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00D09E"
        translucent={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Change PIN</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Pin</Text>
          <View style={styles.pinInputContainer}>
            <TextInput
              style={styles.pinInput}
              value={currentPin}
              onChangeText={(value) => handlePinChange(value, setCurrentPin)}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              placeholder="• • • •"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.label}>New Pin</Text>
          <View style={styles.pinInputContainer}>
            <TextInput
              style={styles.pinInput}
              value={newPin}
              onChangeText={(value) => handlePinChange(value, setNewPin)}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              placeholder="• • • •"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.label}>Confirm Pin</Text>
          <View style={styles.pinInputContainer}>
            <TextInput
              style={styles.pinInput}
              value={confirmPin}
              onChangeText={(value) => handlePinChange(value, setConfirmPin)}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              placeholder="• • • •"
              placeholderTextColor="#999"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.changeButton,
              (!currentPin || !newPin || !confirmPin) && styles.disabledButton,
            ]}
            onPress={handleChangePin}
            disabled={!currentPin || !newPin || !confirmPin}
          >
            <Text style={styles.changeButtonText}>Change Pin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00D09E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 11,
    backgroundColor: "#00D09E",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  inputContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 8,
    marginTop: 16,
  },
  pinInputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pinInput: {
    fontSize: 18,
    color: "#1A1A1A",
    letterSpacing: 8,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  changeButton: {
    backgroundColor: "#00D09E",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ChangePinScreen;
