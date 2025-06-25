import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import securityStyles from "../../styles/profile/securityStyles";

interface DeleteAccountFormProps {
  onDelete: (password: string) => void;
  onCancel: () => void;
}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({
  onDelete,
  onCancel,
}) => {
  const [password, setPassword] = useState("");

  return (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Are You Sure You Want To Delete Your Account?
      </Text>

      <Text style={{ marginBottom: 20, textAlign: "center", color: "#666" }}>
        This action will permanently delete all of your data and cannot be
        undone. Please confirm by entering your password.
      </Text>

      <Text style={{ marginBottom: 10, color: "#666" }}>
        Please Enter Your Password To Confirm Deletion Of Your Account.
      </Text>

      <TextInput
        style={securityStyles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
      />
      <TouchableOpacity
        style={[securityStyles.button, { backgroundColor: "#ff3b30" }]}
        onPress={() => onDelete(password)}
      >
        <Text style={securityStyles.buttonText}>Yes, Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          securityStyles.button,
          { backgroundColor: "#ccc", marginTop: 10 },
        ]}
        onPress={onCancel}
      >
        <Text style={securityStyles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeleteAccountForm;
