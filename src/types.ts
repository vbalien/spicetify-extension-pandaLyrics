// Server - Client Protocol
export type PandaLyricsEvent = SongChangeEvent | TickEvent | StateChangeEvent;
export type PandaLyricsEventBase<
  T extends string,
  D extends Record<string, string | number | boolean>
> = {
  type: T;
  data: D;
};
export type SongChangeEvent = PandaLyricsEventBase<
  'songchange',
  {
    artist: string;
    title: string;
    songID: string;
    is_paused?: boolean;
  }
>;
export type TickEvent = PandaLyricsEventBase<
  'tick',
  {
    time: number;
  }
>;
export type StateChangeEvent = PandaLyricsEventBase<
  'statechange',
  {
    is_paused: boolean;
  }
>;

// Worker - Renderer Protocol
type WorkerReceiveMessage = 'open' | 'requestProgress' | 'requestSong';
export type WorkerReceiveMessageEvent = MessageEvent<WorkerReceiveMessage>;

type WorkerPostMessageBase<
  T extends string,
  D extends Record<string, string | number | boolean> | number
> = {
  type: T;
  data: D;
};
type WorkerSendSongMessage = WorkerPostMessageBase<
  'sendsong',
  {
    artist?: string;
    title?: string;
    songID?: string;
    is_paused: boolean;
  }
>;
type WorkerSendStateMessage = WorkerPostMessageBase<
  'sendstate',
  {
    is_paused: boolean;
  }
>;
type WorkerRequestTickMessage = WorkerPostMessageBase<'requestTick', number>;
export type WorkerPostMessage =
  | WorkerSendSongMessage
  | WorkerSendStateMessage
  | WorkerRequestTickMessage;

export type WorkerPostMessageEvent = MessageEvent<WorkerPostMessage>;
