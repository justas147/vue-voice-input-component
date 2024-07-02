import { Server } from "socket.io";
import http from "http";
import SpeechStream from "../core/services/SpeechStream";

const SocketLoader = ({ server }: { server: http.Server }): void => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on("connection", (socket: any) => {
    console.log("Made socket connection");
    const speechStream = new SpeechStream(socket);

    socket.on('startStream', (request: any) => {
      speechStream.startStream(request);
    });

    socket.on('audioChunk', (data: DataView) => {
      speechStream.recieveAudioChunk(data);
    });
    socket.on("endStream", () => {
      speechStream.endStream()
    });
  });
};

export default SocketLoader;

