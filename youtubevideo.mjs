import ffmpegPath from "ffmpeg-static";
import cp from "child_process";
import stream from "stream";
import ytdl from "ytdl-core";
import formatBytes from "./utils/formatBytes.mjs";
import formatNumber from "./utils/formatNumber.mjs";
import formatTime from "./utils/formatTime.mjs";

class YoutubeVideo {
  constructor(url) {
    this.url = url;
  }

  async get_video_info() {
    const info = await ytdl.getInfo(this.url);
    const videoFormats = info.formats.filter(
      (fomrat) =>
        fomrat.container === "mp4" &&
        fomrat.mimeType.replaceAll('"', "").includes("avc1") &&
        !fomrat.hasAudio
    );

    const audioFormat = info.formats.filter(
      (fomrat) => fomrat.container === "mp4" && !fomrat.hasVideo
    )[0];

    const formattedVideoFormats = videoFormats.map((vformat) => ({
      itag: vformat.itag,
      size: vformat.contentLength
        ? formatBytes(
            parseInt(vformat.contentLength) +
              parseInt(audioFormat.contentLength)
          )
        : "MB",
      res: vformat.qualityLabel,
    }));

    const formattedAudioFormat = {
      itag: audioFormat.itag,
      size: formatBytes(audioFormat.contentLength),
    };

    const videoDetails = {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      publish_date: info.videoDetails.publishDate,
      duration: formatTime(info.videoDetails.lengthSeconds),
      views: formatNumber(info.videoDetails.viewCount),
      thumbnail: info.videoDetails.thumbnails.at(-1).url.split("?")[0],
      video_id: info.videoDetails.videoId,
    };

    return {
      formats: {
        video: formattedVideoFormats,
        audio: formattedAudioFormat,
      },
      videoDetails: videoDetails,
    };
  }

  async download_audio() {
    const info = await ytdl.getInfo(this.url);

    const audioStream = ytdl.downloadFromInfo(info, {
      quality: "highestaudio",
    });

    return { audioStream, title: info.videoDetails.title };
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
}

export default YoutubeVideo;
