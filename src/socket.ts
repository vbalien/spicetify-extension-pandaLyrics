import { PandaLyricsEvent } from './types';
import { version } from '../package.json';

export default class Socket extends EventTarget {
  private socket?: WebSocket;
  private tickTimer?: NodeJS.Timer;

  constructor(private port: number) {
    super();
  }

  connect() {
    this.socket = new WebSocket(`ws://localhost:${this.port}/pandaLyrics`);
    this.socket.addEventListener('open', () => {
      this.dispatchEvent(new Event('open'));
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
      }
      this.tickTimer = setInterval(() => postMessage('requestProgress'), 200);
      postMessage('requestSong');
    });

    this.socket.addEventListener('close', () => {
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
      }
      setTimeout(() => {
        this.connect();
      }, 1000);
    });

    this.socket.addEventListener('error', () => {
      this.socket?.close();
    });
  }

  tick(time: number) {
    this.emitEvent({
      type: 'tick',
      data: {
        time,
      },
    });
  }

  get isReady() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  sendSong(
    title?: string,
    artist?: string,
    songID?: string,
    is_paused?: boolean
  ) {
    this.emitEvent({
      type: 'songchange',
      data: {
        title: title ?? '',
        artist: artist ?? '',
        songID: songID ?? '',
        is_paused,
      },
    });
  }

  sendState(is_paused: boolean) {
    this.emitEvent({
      type: 'statechange',
      data: {
        is_paused,
      },
    });
  }

  emitEvent(event: PandaLyricsEvent) {
    this.socket?.send(JSON.stringify(event));
  }
}
