/* Firebase */
window.BG = window.BG || {};
BG.fb = BG.fb || {};
firebase.initializeApp({
  apiKey: "AIzaSyC4nebdvhGrJgUpnUuC3ZeTBKyFRhVju_8",
  authDomain: "the-bet-game.firebaseapp.com",
  databaseURL: "https://the-bet-game-default-rtdb.firebaseio.com",
  projectId: "the-bet-game",
  storageBucket: "the-bet-game.firebasestorage.app",
  messagingSenderId: "774165159243",
  appId: "1:774165159243:web:f8bcd120572dbb1d1c9cce"
});
const db = firebase.database();
async function saveRoom(code, data) { await db.ref(`rooms/${code}`).set(data); }
function subscribeRoom(code, cb) {
  const r = db.ref(`rooms/${code}`);
  r.on("value", s => { if (s.exists()) cb(s.val()); });
  return () => r.off();
}
async function loadRoom(code) {
  const s = await db.ref(`rooms/${code}`).get();
  return s.exists() ? s.val() : null;
}

BG.fb.saveRoom = saveRoom;
BG.fb.subscribeRoom = subscribeRoom;
BG.fb.loadRoom = loadRoom;
BG.fb.db = db;
