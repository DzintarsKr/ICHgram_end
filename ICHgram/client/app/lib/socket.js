import { io } from "socket.io-client";
import { getToken } from "@/lib/api";

let socket = null;

export function connectSocket() {
  if (!socket) {
    socket = io({ auth: { token: getToken() } });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
