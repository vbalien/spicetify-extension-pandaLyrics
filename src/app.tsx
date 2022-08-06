import { WorkerPostMessage, WorkerPostMessageEvent } from "./event";
import Socket from "./socket";
import PandaLyricsWorker from "./worker";
const PORT = 8999;

async function main() {
  if (!navigator.serviceWorker) {
    // worker
    const socket = new Socket(PORT);
    socket.addEventListener("open", () => {
      postMessage("open");
    });
    socket.connect();

    onmessage = ({ data: payload }: WorkerPostMessageEvent) => {
      switch (payload.type) {
        case "requestTick":
          socket.tick(payload.data);
          break;
        case "sendsong":
          if (!socket.isReady) {
            break;
          }
          socket.sendSong(
            payload.data.title,
            payload.data.artist,
            payload.data.songID,
            payload.data.is_paused
          );
          break;
        case "sendstate":
          if (!socket.isReady) {
            break;
          }
          socket.sendState(payload.data.is_paused);
          break;
      }
    };
  } else {
    // renderer
    if (!window.pandaLyricsWorker) {
      window.pandaLyricsWorker = new PandaLyricsWorker();
    }
  }
}

export default main;
