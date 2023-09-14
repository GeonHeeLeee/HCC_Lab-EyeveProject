import {Socket} from "socket.io-client";

export type IsLogin = {
  value: boolean;
}
export type LoginUsername = {
  username: string;
}

export type ShowSignup = {
  value: boolean;
}

// TODO: any 변경
export type SocketState = {
  socket: Socket|null,
  others: any[];
}

export type RootState = {
  isLogin: IsLogin;
  loginUsername: LoginUsername;
  showSignup: ShowSignup;
  socket: SocketState,
}