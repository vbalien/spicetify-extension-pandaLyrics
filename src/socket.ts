import { PandaLyricsEvent } from "./event";

export default class Socket {
  private socket?: WebSocket;
  private tickTimer?: NodeJS.Timer;

  constructor(private port: number) {}

  connect() {
    this.socket = new WebSocket(`ws://localhost:${this.port}/pandaLyrics`);
    this.socket.addEventListener("open", (event) => {
      Spicetify.showNotification("PandaLyrics Connected.");
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
      }
      this.tickTimer = setInterval(this.tick.bind(this), 200);
      this.sendSong();
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

  tick() {
    const time = Spicetify.Player.getProgress();
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

  sendSong() {
    const data = Spicetify.Player.data || Spicetify.Queue;
    if (!data || !data.track) {
      return;
    }
    const meta = data.track.metadata;
    if (!meta) {
      return;
    }
    const title = meta.title;
    const artist = meta.artist_name;

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
