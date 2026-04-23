import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/backend.js";

export const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});
