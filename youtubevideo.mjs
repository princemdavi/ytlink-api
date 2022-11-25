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

  async get_video_info(format) {
    const info = await ytdl.getInfo(this.url);
    const codec = (videoFormat) =>
      format == "mp4"
        ? videoFormat.mimeType.replaceAll('"', "").includes("avc1")
        : true;
    const videoFormats = info.formats.filter(
      (videoFormat) =>
        videoFormat.container === format &&
        codec(videoFormat) &&
        !videoFormat.hasAudio &&
        videoFormat.contentLength
    );

    const audioFormat = info.formats.filter(
      (audioFomrat) => audioFomrat.container === format && !audioFomrat.hasVideo
    )[0];

    let formattedVideoFormats = [];

    videoFormats.reverse().forEach((vformat) => {
      const resolutions = formattedVideoFormats.map((format) => format.res);
      if (resolutions.includes(vformat.qualityLabel.split("p")[0] + "p"))
        return;
      formattedVideoFormats.push({
        itag: vformat.itag,
        size: formatBytes(
          parseInt(vformat.contentLength) + parseInt(audioFormat.contentLength)
        ),
        res: vformat.qualityLabel.split("p")[0] + "p",
      });
    });

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
      formats: formattedVideoFormats.reverse(),
      videoDetails: videoDetails,
    };
  }

  async get_audio_info() {
    const info = await ytdl.getInfo(this.url);
    const audioFormat = info.formats.filter(
      (audioFomrat) => audioFomrat.container === "mp4" && !audioFomrat.hasVideo
    )[0];
    return audioFormat;
  }

  async download(itag, format) {
    const info = await ytdl.getInfo(this.url);

    //! download audio file
    if (format == "mp3") {
      const audioStream = ytdl.downloadFromInfo(info, {
        quality: itag,
      });

      return {
        stream: audioStream,
        title: info.videoDetails.title,
      };
    }

    //! download video file
    const result = new stream.PassThrough({
      highWaterMark: 1024 * 512,
    });

    const audioFormat = info.formats.filter(
      (audioFomrat) => audioFomrat.container === format && !audioFomrat.hasVideo
    )[0];

    let audioStream = ytdl.downloadFromInfo(info, {
      quality: audioFormat.itag,
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
    return { stream: result, title: info.videoDetails.title };
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

  async getStreamVideoSIze() {
    const info = await ytdl.getInfo(this.url);
    const formatWithOnlyVideo = info.formats.filter(
      (format) =>
        format.container == "mp4" && !format.hasAudio && format.hasVideo
    );
    const audioFormat = info.formats.filter(
      (format) =>
        format.container == "mp4" && format.hasAudio && !format.hasVideo
    )[0];

    const mediumVideo = formatWithOnlyVideo.find(
      (format) => format.qualityLabel == "360p"
    );
    return mediumVideo.contentLength + audioFormat.contentLength;
  }

  stream_audio(options = {}) {
    const stream = ytdl(this.url, {
      ...options,
    });

    return stream;
  }

  async stream_video(options = {}) {
    const info = await ytdl.getInfo(this.url);
    const formatWithBothAudioAndVideo = info.formats.filter(
      (format) =>
        format.container == "mp4" && format.hasAudio && format.hasVideo
    );

    const mediumVideo = formatWithBothAudioAndVideo.find(
      (format) => format.qualityLabel == "360p"
    );

    const stream = ytdl.downloadFromInfo(info, {
      ...options,
      quality: mediumVideo.itag,
    });

    return stream;
  }
}

export default YoutubeVideo;
