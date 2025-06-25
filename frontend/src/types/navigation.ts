export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  SecurityPin: {
    email: string;
  };
  ResetPassword: {
    email: string;
    resetCode: string;
  };
  MainApp: undefined;
  TabNavigator: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Category: undefined;
  Transaction: undefined;
  Budget: undefined;
  Report: undefined;
  Settings: undefined;
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
