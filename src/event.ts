export type PandaLyricsEvent = SongChangeEvent | TickEvent;
export type PandaLyricsEventBase<
  T extends string = string,
  D extends Record<string, string | number> = Record<string, string | number>
> = {
  type: T;
  data: D;
};
export type SongChangeEvent = PandaLyricsEventBase<
  "songchange",
  {
    artist: string;
    title: string;
  }
>;
export type TickEvent = PandaLyricsEventBase<
  "tick",
  {
    time: number;
  }
>;
