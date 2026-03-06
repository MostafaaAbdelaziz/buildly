import React, { useMemo , useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

export default function TwoPMCheckScreen({ navigation }) {
  const { user } = useAuth();
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);

  const todayKey = user?.uid
  ? `2pm_check_${user.uid}_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`
  : `2pm_check_guest_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;

  // strict 2:00 PM check
  const isTwoPM = hours === 14 && minutes < 60; //Open for 60 mins //CHANGE TO 14 FOR 2PM

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  useEffect(() => {
    // Check if user has already answered today stored in the async storage with key `${todayKey}`
    AsyncStorage.getItem(todayKey).then((value) => {
      if (value) {
        setHasAnsweredToday(true);
      }
    });
  }, [todayKey]);

  async function handleAnswer(isOnTrack) {
    // Save answer to AsyncStorage
    await AsyncStorage.setItem(todayKey, isOnTrack ? "on_track" : "not_on_track");
    setHasAnsweredToday(true);
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Status</Text>
      <Text style={styles.date}>{todayLabel}</Text>

      {hasAnsweredToday ? (
        <Text style={styles.message}>
          Thank you for your answer today! 
          Come back tomorrow at 2PM for another check in!
        </Text>
      ) : isTwoPM ? (
        <>
          <Text style={styles.question}>Everything on track?</Text>

          <TouchableOpacity
            style={[styles.button, styles.yesButton]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.noButton]}
            onPress={async () => {
              await handleAnswer(false);
              navigation.navigate("CreateIssue");
            }}
          >
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.message}>
          2PM Check is only available at 2:00 PM.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#111",
  },
  date: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    fontWeight: "600",
  },
  question: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#222",
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  yesButton: {
    backgroundColor: "green",
  },
  noButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
  },
  message: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
});