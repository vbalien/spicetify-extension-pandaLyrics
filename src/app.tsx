import Socket from "./socket";
const PORT = 8999;

async function main() {
  const socket = new Socket(PORT);
  socket.connect();

  Spicetify.Player.addEventListener("songchange", () => {
    if (!socket.isReady) {
      return;
    }
    socket.sendSong();
  });
}

export default main;
