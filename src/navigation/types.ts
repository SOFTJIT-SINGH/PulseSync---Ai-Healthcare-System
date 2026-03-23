import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Dashboard: undefined;
  Metrics: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList>;
  // We will add the Auth stack here in Phase 2
};
