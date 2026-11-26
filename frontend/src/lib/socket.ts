import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getTelemetrySocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
    socket = io(wsUrl, {
      autoConnect: true,
    });
  }
  return socket;
}