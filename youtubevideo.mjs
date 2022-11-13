import ffmpegPath from "ffmpeg-static";
import cp from "child_process";
import stream from "stream";
import ytdl from "ytdl-core";

class YoutubeVideo {
  constructor(url) {
    this.url = url;
  }

  download_audio() {
    const audioStream = ytdl(this.url, {
      quality: "highestaudio",
    });

    return { audioStream };
  }

  stream(options = {}) {
    const stream = ytdl(this.url, {
      ...options,
    });

    return stream;
  }

  getSize(options = {}) {
    return new Promise((resolve) => {
      const audioStream = ytdl(this.url, {
        ...options,
      });
      audioStream.on("info", (info, format) => {
        resolve(parseInt(format.contentLength));
      });
    });
  }

  async download_video(itag) {
    const result = new stream.PassThrough({
      highWaterMark: 1024 * 512,
    });

    const info = await ytdl.getInfo(this.url);

    let audioStream = ytdl.downloadFromInfo(info, {
      quality: "highestaudio",
    });

    let videoStream = ytdl.downloadFromInfo(info, {
      quality: itag,
    });
    // create the ffmpeg process for muxing
    let ffmpegProcess = cp.spawn(
      ffmpegPath,
      [
        // supress non-crucial messages
        "-loglevel",
        "8",
        "-hide_banner",
        // input audio and video by pipe
        "-i",
        "pipe:3",
        "-i",
        "pipe:4",
        // map audio and video correspondingly
        "-map",
        "0:a",
        "-map",
        "1:v",
        // no need to change the codec
        "-c",
        "copy",
        // output mp4 and pipe
        "-f",
        "matroska",
        "pipe:5",
      ],
      {
        // no popup window for Windows users
        windowsHide: true,
        stdio: [
          // silence stdin/out, forward stderr,
          "inherit",
          "inherit",
          "inherit",
          // and pipe audio, video, output
          "pipe",
          "pipe",
          "pipe",
        ],
      }
    );
    audioStream.pipe(ffmpegProcess.stdio[3]);
    videoStream.pipe(ffmpegProcess.stdio[4]);
    ffmpegProcess.stdio[5].pipe(result);
    return { videoStream: result, title: info.videoDetails.title };
  }
}

export default YoutubeVideo;
