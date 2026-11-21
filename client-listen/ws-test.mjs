import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connecté au WebSocket :', socket.id);
});

socket.on('metric.created', (data) => {
  console.log('[metric.created] reçu :', JSON.stringify(data, null, 2));
});

socket.on('alert.triggered', (data) => {
  console.log('[alert.triggered] reçu :', JSON.stringify(data, null, 2));
});

socket.on('disconnect', () => {
  console.log('Déconnecté du WebSocket');
});