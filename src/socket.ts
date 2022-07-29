import { PandaLyricsEvent } from "./event";

export default class Socket extends EventTarget {
  private socket?: WebSocket;
  private tickTimer?: NodeJS.Timer;

  constructor(private port: number) {
    super();
  }

  connect() {
    this.socket = new WebSocket(`ws://localhost:${this.port}/pandaLyrics`);
    this.socket.addEventListener("open", (event) => {
      this.dispatchEvent(new Event("open"));
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
      }
      this.tickTimer = setInterval(() => postMessage("requestProgress"), 200);
      postMessage("requestSong");
    });

    this.socket.addEventListener("close", (event) => {
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
      }
      setTimeout(() => {
        this.connect();
      }, 1000);
    });

    this.socket.addEventListener("error", (event) => {
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
      }
      setTimeout(() => {
        this.connect();
      }, 1000);
    });
  }

  tick(time: number) {
    this.emitEvent({
      type: "tick",
      data: {
        time,
      },
    });
  }

  get isReady() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  sendSong(title: string, artist: string) {
    this.emitEvent({
      type: "songchange",
      data: {
        title: title ?? "",
        artist: artist ?? "",
      },
    });
  }

  emitEvent(event: PandaLyricsEvent) {
    this.socket?.send(JSON.stringify(event));
  }
}
