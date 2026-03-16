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
  Favorites: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Profile: undefined;
  ChangePassword: undefined;
  EditEmail: undefined;
  EditPhone: undefined;
  EditName: undefined;
  ProductDetail: { productId: number };
  Checkout: { fromQuickBuy?: boolean };
  WriteReview: { orderId: string; orderId_numeric: number };
  MyRewards: undefined;
  ProductReviews: { productId: number };
};

export type NavigationProps = {
  navigation: {
    replace: (screen: keyof RootStackParamList) => void;
    navigate: <K extends keyof RootStackParamList>(
      screen: K,
      params?: RootStackParamList[K],
    ) => void;
    goBack: () => void;
    canGoBack: () => boolean;
  };
};
