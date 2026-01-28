export type RootStackParamList = {
  Intro: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyRegisterOTP: {
    email: string;
    fullName: string;
    username: string;
    password: string;
    phoneNumber?: string;
  };
  ForgotPassword: undefined;
  Homepage: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type NavigationProps = {
  navigation: {
    replace: (screen: keyof RootStackParamList) => void;
    navigate: <K extends keyof RootStackParamList>(
      screen: K,
      params?: RootStackParamList[K]
    ) => void;
    goBack: () => void;
    canGoBack: () => boolean;
  };
};