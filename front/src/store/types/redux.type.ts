import { HttpInterface } from '../../api/http/httpInterface';

export type IsLogin = {
  value: boolean;
};
export type LoginUser = {
  userId: string;
  userName: string;
  userType: 'PROFESSOR' | 'STUDENT' | undefined;
  roomName: string | null;
};

export type ShowSignup = {
  value: boolean;
};

// TODO: any 변경
export type SocketState = {
  socket: WebSocket | null;
};

export type Network = {
  networkInterface: HttpInterface;
};

export type RootState = {
  isLogin: IsLogin;
  loginUser: LoginUser;
  showSignup: ShowSignup;
  socket: SocketState;
  network: Network;
};
