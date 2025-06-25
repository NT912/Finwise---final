import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { colors } from "../../theme";

type RouteParams = {
  AddNote: {
    note: string;
    onSaveNote: (note: string) => void;
  };
};

const AddNoteScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "AddNote">>();
  const { note: initialNote, onSaveNote } = route.params || {
    note: "",
    onSaveNote: () => { },
  };

  const [note, setNote] = useState(initialNote || "");

  const handleSave = () => {
    if (onSaveNote) {
      onSaveNote(note);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Note</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Note Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.noteContainer}
      >
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Enter your note here..."
          placeholderTextColor="#AAAAAA"
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  noteContainer: {
    flex: 1,
    padding: 16,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    textAlignVertical: "top",
    padding: 0,
    lineHeight: 24,
  },
});

export default AddNoteScreen;
