import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LaunchScreen from "../screens/LaunchScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import SecurityPinScreen from "../screens/Auth/SecurityPinScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import TransactionScreen from "../screens/Transaction/TransactionScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SettingsScreen from "../screens/Profile/SettingsScreen";
import SecurityScreen from "../screens/Security/SecurityScreen";
import HelpScreen from "../screens/Profile/HelpScreen";
import DeleteAccountScreen from "../screens/Profile/DeleteAccountScreen";
import TermsAndConditionsScreen from "../screens/Profile/TermsAndConditionsScreen";
import LogoutScreen from "../screens/Profile/LogoutScreen";
import ChangePasswordScreen from "../screens/Profile/ChangePasswordScreen";
import AddTransactionScreen from "../screens/Transaction/AddTransactionScreen";
import EditTransactionScreen from "../screens/Transaction/EditTransactionScreen";
import WalletScreen from "../screens/Wallet/WalletScreen";
import SelectWalletScreen from "../screens/Wallet/SelectWalletScreen";
import SelectCategoryScreen from "../screens/Category/SelectCategoryScreen";
import { User } from "../types";
import CustomTabBar from "../components/CustomTabBar";
import ChangePinScreen from "../screens/Security/ChangePinScreen";
import SavingScreen from "../screens/Saving/SavingScreen";
import CreateWalletScreen from "../screens/Wallet/CreateWalletScreen";
import EditWalletScreen from "../screens/Wallet/EditWalletScreen";
import IncomeExpenseReportScreen from "../screens/Reports/IncomeExpenseReportScreen";
import BudgetScreen from "../screens/Budget/BudgetScreen";
import CreateBudgetScreen from "../screens/Budget/CreateBudgetScreen";
import EditBudgetScreen from "../screens/Budget/EditBudgetScreen";
import { colors } from "../theme";
import {
  RootStackParamList,
  HomeStackParamList,
  ProfileStackParamList,
  SavingStackParamList,
  TransactionStackParamList,
  TabParamList,
  BudgetStackParamList,
} from "./types";
import CreateCategoryScreen from "../screens/Category/CreateCategoryScreen";
import AddNoteScreen from "../screens/Transaction/AddNoteScreen";
import { EditProfileScreen } from "../screens/Profile/EditProfileScreen";
import { ReportPeriod } from "../screens/Transaction/ReportPeriod";

interface AppNavigatorProps {
  initialAuthenticated?: boolean;
  forceLogin?: boolean;
  initialRouteName?: keyof RootStackParamList;
}

const Stack = createStackNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const TransactionStack = createStackNavigator<TransactionStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const SavingStack = createStackNavigator<SavingStackParamList>();
const Tab = createBottomTabNavigator();
const BudgetStack = createStackNavigator<BudgetStackParamList>();

// Home Stack
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="AddTransaction" component={AddTransactionScreen} />
    <HomeStack.Screen name="WalletScreen" component={WalletScreen} />
    <HomeStack.Screen
      name="CreateWalletScreen"
      component={CreateWalletScreen}
    />
    <HomeStack.Screen name="EditWalletScreen" component={EditWalletScreen} />
  </HomeStack.Navigator>
);

// Replace CategoryStack with TransactionStack
const TransactionStackNavigator = () => (
  <TransactionStack.Navigator screenOptions={{ headerShown: false }}>
    <TransactionStack.Screen name="Transaction" component={TransactionScreen} />
    <TransactionStack.Screen
      name="AddTransaction"
      component={AddTransactionScreen}
    />
    <TransactionStack.Screen
      name="EditTransaction"
      component={EditTransactionScreen}
    />
    <TransactionStack.Screen name="ReportPeriod" component={ReportPeriod} />
  </TransactionStack.Navigator>
);

// Saving Stack
const SavingStackNavigator = () => (
  <SavingStack.Navigator screenOptions={{ headerShown: false }}>
    <SavingStack.Screen name="Saving" component={SavingScreen} />
  </SavingStack.Navigator>
);

// Profile Stack
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Security" component={SecurityScreen} />
    <ProfileStack.Screen name="Help" component={HelpScreen} />
    <ProfileStack.Screen name="Terms" component={TermsAndConditionsScreen} />
    <ProfileStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
    />
    <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    <ProfileStack.Screen name="Logout" component={LogoutScreen} />
  </ProfileStack.Navigator>
);

// Add BudgetStack Navigator
const BudgetStackNavigator = () => (
  <BudgetStack.Navigator screenOptions={{ headerShown: false }}>
    <BudgetStack.Screen name="BudgetMain" component={BudgetScreen} />
    <BudgetStack.Screen name="CreateBudget" component={CreateBudgetScreen} />
    <BudgetStack.Screen name="EditBudget" component={EditBudgetScreen} />
    <BudgetStack.Screen
      name="SelectCategory"
      component={SelectCategoryScreen}
    />
    <BudgetStack.Screen name="SelectWallet" component={SelectWalletScreen} />
  </BudgetStack.Navigator>
);

// Tab Navigator - This is where our TabBar lives
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: "#ffffff",
          borderRadius: 15,
          height: 70,
          paddingBottom: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? colors.primary : colors.textSecondary}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="TransactionTab"
        component={TransactionStackNavigator}
        options={{
          tabBarLabel: "Transactions",
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "wallet" : "wallet-outline"}
                size={24}
                color={focused ? colors.primary : colors.textSecondary}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="BudgetTab"
        component={BudgetStackNavigator}
        options={{
          tabBarLabel: "Budget",
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "pie-chart" : "pie-chart-outline"}
                size={24}
                color={focused ? colors.primary : colors.textSecondary}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? colors.primary : colors.textSecondary}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: 10,
  },
});

export default function AppNavigator({
  initialAuthenticated = false,
  forceLogin = false,
  initialRouteName = "Launch",
}: AppNavigatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [showLaunch, setShowLaunch] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const checkToken = async () => {
      try {
        // Nếu forceLogin = true, luôn luôn đặt userToken = null
        if (forceLogin) {
          console.log("🔒 Bắt buộc đăng nhập theo cài đặt");
          setUserToken(null);
        } else {
          // Nếu initialAuthenticated được cung cấp, sử dụng giá trị đó
          if (initialAuthenticated) {
            const token = await AsyncStorage.getItem("token");
            setUserToken(token);
          } else {
            // Nếu không, kiểm tra token trong AsyncStorage
            const token = await AsyncStorage.getItem("token");
            setUserToken(token);
          }
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [initialAuthenticated, forceLogin]);

  // Tự động chuyển hướng sau khi hiển thị màn hình Launch
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowLaunch(false);
      }, 2000); // Hiển thị màn hình Launch trong 2 giây

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Hiển thị màn hình loading nếu đang kiểm tra token
  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#fff" },
      }}
      initialRouteName={
        showLaunch ? "Launch" : userToken ? "TabNavigator" : "Login"
      }
    >
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SecurityPin" component={SecurityPinScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      {/* Main tab navigator that contains the TabBar */}
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Other screens not directly accessible through tabs */}
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePin"
        component={ChangePinScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={require("../screens/Auth/TermsOfUseScreen").default}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={require("../screens/Auth/PrivacyPolicyScreen").default}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WalletScreen"
        component={WalletScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen
        name="CreateWalletScreen"
        component={CreateWalletScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen
        name="EditWalletScreen"
        component={EditWalletScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen
        name="IncomeExpenseReportScreen"
        component={IncomeExpenseReportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectWallet"
        component={SelectWalletScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectCategory"
        component={SelectCategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateCategory"
        component={CreateCategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AddNote" component={AddNoteScreen} />
    </Stack.Navigator>
  );
}
