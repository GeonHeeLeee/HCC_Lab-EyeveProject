export type IsLogin = {
  value: boolean;
}
export type LoginUsername = {
  username: string;
}

export type ShowSignup = {
  value: boolean;
}

export type RootState = {
  isLogin: IsLogin;
  loginUsername: LoginUsername;
  showSignup: ShowSignup;
}