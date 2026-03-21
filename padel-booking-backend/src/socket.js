let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io no está inicializado");
  }
  return ioInstance;
}