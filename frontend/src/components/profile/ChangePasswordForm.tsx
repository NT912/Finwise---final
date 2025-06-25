import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  changePassword,
  sendPasswordChangeCode,
} from "../../services/profileService";
import securityStyles from "../../styles/profile/securityStyles";

const VerificationMethod = {
  PASSWORD: "password",
  EMAIL: "email",
};

const ChangePasswordForm = ({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMethod, setVerificationMethod] = useState(
    VerificationMethod.PASSWORD
  );
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      await sendPasswordChangeCode();
      setCodeSent(true);
      Alert.alert("Success", "Verification code sent to your email");
    } catch (error) {
      Alert.alert("Error", "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;

    try {
      setLoading(true);

      switch (verificationMethod) {
        case VerificationMethod.PASSWORD:
          if (!currentPassword) {
            Alert.alert("Error", "Current password is required");
            setLoading(false);
            return;
          }

          await changePassword({
            currentPassword,
            newPassword,
          });
          break;

        case VerificationMethod.EMAIL:
          if (!verificationCode) {
            Alert.alert("Error", "Verification code is required");
            setLoading(false);
            return;
          }
          await changePassword({
            currentPassword: verificationCode,
            newPassword,
          });
          break;
      }

      Alert.alert("Success", "Password changed successfully");
      onSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        verificationMethod === VerificationMethod.PASSWORD
          ? "Current password is incorrect"
          : "Verification code is invalid or expired"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <View style={styles.methodSelector}>
        <Text style={styles.methodTitle}>Verification Method:</Text>

        <View style={styles.methodButtons}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              verificationMethod === VerificationMethod.PASSWORD &&
              styles.methodButtonActive,
            ]}
            onPress={() => setVerificationMethod(VerificationMethod.PASSWORD)}
          >
            <Ionicons
              name="key-outline"
              size={20}
              color={
                verificationMethod === VerificationMethod.PASSWORD
                  ? "#fff"
                  : "#333"
              }
            />
            <Text
              style={[
                styles.methodButtonText,
                verificationMethod === VerificationMethod.PASSWORD &&
                styles.methodButtonTextActive,
              ]}
            >
              Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              verificationMethod === VerificationMethod.EMAIL &&
              styles.methodButtonActive,
            ]}
            onPress={() => setVerificationMethod(VerificationMethod.EMAIL)}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={
                verificationMethod === VerificationMethod.EMAIL
                  ? "#fff"
                  : "#333"
              }
            />
            <Text
              style={[
                styles.methodButtonText,
                verificationMethod === VerificationMethod.EMAIL &&
                styles.methodButtonTextActive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Verification Fields */}
      {verificationMethod === VerificationMethod.PASSWORD && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder="Enter current password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {verificationMethod === VerificationMethod.EMAIL && (
        <View style={styles.emailVerificationContainer}>
          <Text style={styles.label}>Verification Code</Text>
          <View style={styles.codeContainer}>
            <TextInput
              style={styles.input}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter verification code"
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[styles.sendCodeButton, codeSent && styles.resendButton]}
              onPress={handleSendVerificationCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendCodeButtonText}>
                  {codeSent ? "Resend Code" : "Send Code"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {codeSent && (
            <Text style={styles.codeSentText}>
              A verification code has been sent to your email
            </Text>
          )}
        </View>
      )}

      {/* New Password Fields (always visible) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            placeholder="Enter new password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="Confirm new password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={securityStyles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={securityStyles.buttonText}>Change Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[securityStyles.button, styles.cancelButton]}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={securityStyles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  methodSelector: {
    marginBottom: 20,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  methodButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    marginHorizontal: 4,
  },
  methodButtonActive: {
    backgroundColor: "#00D09E",
    borderColor: "#00D09E",
  },
  methodButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#333",
  },
  methodButtonTextActive: {
    color: "#fff",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  emailVerificationContainer: {
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sendCodeButton: {
    backgroundColor: "#00D09E",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  resendButton: {
    backgroundColor: "#888",
  },
  sendCodeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  codeSentText: {
    color: "#00D09E",
    fontSize: 12,
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    marginTop: 10,
  },
});

export default ChangePasswordForm;
