export type RootStackParamList = {
  Intro: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Homepage: undefined;
};

export type NavigationProps = {
  navigation: {
    replace: (screen: keyof RootStackParamList) => void;
    navigate: (screen: keyof RootStackParamList) => void;
    goBack: () => void;
  };
};