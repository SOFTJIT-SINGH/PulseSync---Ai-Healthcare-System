import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Dashboard: undefined;
  Metrics: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<BottomTabParamList>;
};