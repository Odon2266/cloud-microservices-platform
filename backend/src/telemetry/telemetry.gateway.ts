import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WS] Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client déconnecté : ${client.id}`);
  }

  emitMetricCreated(payload: unknown) {
    this.server.emit('metric.created', payload);
  }

  emitAlertTriggered(payload: unknown) {
    this.server.emit('alert.triggered', payload);
  }
}