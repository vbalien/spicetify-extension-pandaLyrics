import Socket from "./socket";
const PORT = 8999;

function getSong(): { artist?: string; title?: string } | null {
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
  return { title, artist };
}

async function main() {
  if (!navigator.serviceWorker) {
    // worker inside
    const socket = new Socket(PORT);
    socket.addEventListener("open", () => {
      postMessage("open");
    });
    socket.connect();

    onmessage = ({ data: payload }) => {
      switch (payload.type) {
        case "requestTick":
          socket.tick(payload.data);
          break;
        case "sendsong":
          if (!socket.isReady) {
            break;
          }
          socket.sendSong(payload.data.title, payload.data.artist);
          break;
      }
    };
  } else {
    const worker = new Worker("./extensions/pandaLyrics.js");
    worker.onmessage = (event) => {
      switch (event.data) {
        case "open":
          Spicetify.showNotification("PandaLyrics Connected.");
          break;
        case "requestProgress":
          const time = Spicetify.Player.getProgress();
          worker.postMessage({ type: "requestTick", data: time });
          break;
        case "requestSong":
          worker.postMessage({ type: "sendsong", data: getSong() });
          break;
      }
    };
    Spicetify.Player.addEventListener("songchange", () => {
      worker.postMessage({ type: "sendsong", data: getSong() });
    });
  }
}

export default main;
