import { WorkerPostMessage, WorkerReceiveMessageEvent } from './types';

export default class PandaLyricsWorker extends Worker {
  constructor() {
    super('./extensions/pandaLyrics.js');
    this.onmessage = this.onMessage.bind(this);

    Spicetify.Player.addEventListener('songchange', () => {
      this.postMessage({
        type: 'sendsong',
        data: { ...this.getSong(), is_paused: Spicetify.Player.data.is_paused },
      });
    });
    Spicetify.Player.addEventListener('onplaypause', () => {
      this.postMessage({
        type: 'sendstate',
        data: { is_paused: Spicetify.Player.data.is_paused },
      });
    });
  }

  postMessage(message: WorkerPostMessage) {
    super.postMessage(message);
  }

  onMessage(event: WorkerReceiveMessageEvent) {
    switch (event.data) {
      case 'open':
        Spicetify.showNotification('PandaLyrics Connected.');
        break;
      case 'requestProgress':
        const time = Spicetify.Player.getProgress();
        this.postMessage({ type: 'requestTick', data: time });
        break;
      case 'requestSong':
        this.postMessage({
          type: 'sendsong',
          data: {
            ...this.getSong(),
            is_paused: Spicetify.Player.data.is_paused,
          },
        });
        break;
    }
  }

  private getSong(): {
    artist?: string;
    title?: string;
    songID?: string;
  } | null {
    const data = Spicetify.Player.data || Spicetify.Queue;
    if (!data || !data.track) {
      return null;
    }
    const meta = data.track.metadata;
    if (!meta) {
      return null;
    }
    const title = meta.title;
    const artist = meta.artist_name;
    const songID = decodeURI(data.track.uri);
    return { title, artist, songID };
  }
}
