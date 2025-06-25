import React from "react";
import { View, Text } from "react-native";
import * as Progress from "react-native-progress";
import homeStyles from "../../styles/home/homeStyles";
import { formatVND } from "../../utils/formatters";

interface SavingsGoal {
  _id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
}

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[];
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ savingsGoals }) => {
  return (
    <View style={homeStyles.savingsCard}>
      <Text style={homeStyles.savingsTitle}>🎯 Savings On Goals</Text>
      {savingsGoals.length > 0 ? (
        savingsGoals.map((goal: SavingsGoal) => (
          <View key={goal._id} style={homeStyles.savingsGoalItem}>
            <View style={homeStyles.savingsTextContainer}>
              <Text style={homeStyles.goalName}>{goal.goalName}</Text>
              <Text style={homeStyles.goalAmount}>
                {formatVND(goal.currentAmount)} / {formatVND(goal.targetAmount)}
              </Text>
            </View>
            <Progress.Bar
              progress={goal.currentAmount / goal.targetAmount}
              width={200}
              height={10}
              color={
                goal.currentAmount >= goal.targetAmount ? "#00D09E" : "#FFD700"
              }
              borderRadius={5}
              style={homeStyles.savingsProgressBar}
            />
          </View>
        ))
      ) : (
        <Text style={homeStyles.noGoalsText}>No savings goals set.</Text>
      )}
    </View>
  );
};

export default SavingsGoals;
