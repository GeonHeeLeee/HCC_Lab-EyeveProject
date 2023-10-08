import { HttpInterface } from '../../api/http/httpInterface';

export type IsLogin = {
  value: boolean;
};
export type LoginUsername = {
  username: string;
};

export type ShowSignup = {
  value: boolean;
};

// TODO: any 변경
export type SocketState = {
  socket: WebSocket | null;
  otherSockets: (WebSocket | string)[]; // socket id or socket instance?
};

export type Network = {
  networkInterface: HttpInterface;
};

export type RoomName = {
  roomName: string;
};

export type RootState = {
  isLogin: IsLogin;
  loginUsername: LoginUsername;
  showSignup: ShowSignup;
  socket: SocketState;
  network: Network;
  roomName: RoomName;
};
