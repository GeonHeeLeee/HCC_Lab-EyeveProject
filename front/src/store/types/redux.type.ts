import {Socket} from "socket.io-client";
import {HttpInterface} from "../../api/http/httpInterface";
import LoginUserInfo from "../modules/loginUserInfo";

export type IsLogin = {
  value: boolean;
}
export type UserInfo = {
  username: string;
  userId: string;
  userType?: 'STUDENT' | 'PROFESSOR';
}

export type ShowSignup = {
  value: boolean;
}

// TODO: any 변경
export type SocketState = {
  socket: WebSocket | null,
  otherSockets: (WebSocket | string)[];  // socket id or socket instance?
}

export type Network = {
  networkInterface: HttpInterface,
}

export type RootState = {
  isLogin: IsLogin;
  loginUserInfo: UserInfo;
  showSignup: ShowSignup;
  socket: SocketState,
  network: Network,
}

