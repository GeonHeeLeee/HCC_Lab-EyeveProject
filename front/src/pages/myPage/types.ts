export type SocketMessage<T extends MessageType> = {
  messageType: T;
  roomName: T extends 'CREATE' ? string : null;
}

export type MessageType = 'CREATE' | 'JOIN' | 'TALK';

export type SocketMessage2<T extends MessageType> = {
  messageType: MessageType;
}