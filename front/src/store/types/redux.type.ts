export type IsLoginState = {
  value: boolean;
}
export type LoginUsername = {
  value: string;
}

export type ShowSignup = {
  value: string;
}

export type RootState = {
  isLoginState: IsLoginState;
  loginUsername: LoginUsername;
  showSignup: ShowSignup;
}