export default function formatTime(seconds) {
  seconds = Number(seconds);
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor((seconds % 3600) % 60);

  var hDisplay = h >= 10 ? h : `0${h}`;
  var mDisplay = m >= 10 ? m : `0${m}`;
  var sDisplay = s >= 10 ? s : `0${s}`;

  let H = hDisplay ? `${hDisplay}:` : "";
  let M = mDisplay ? `${mDisplay}:` : "";
  let S = sDisplay ? `${sDisplay}` : "";

  return H + M + S;
}
