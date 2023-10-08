let socket: WebSocket | null = null;

export function initSocket(): void {
  if (!socket) {
    socket = new WebSocket('ws://localhost:8081/socket');
  }
}

export function getSocket(): WebSocket | null {
  return socket;
}

export function closeSocket(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
}
