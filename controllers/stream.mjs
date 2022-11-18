import YoutubeVideo from "../youtubevideo.mjs";

export const streamAudio = async (req, res) => {
  try {
    const range = req.headers.range;
    if (!range) return res.status(400).send("error");

    const videoId = req.params.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const yt = new YoutubeVideo(videoUrl);

    const audioSize = await yt.getSize({ quality: "highestaudio" });
    const chunkSize = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, audioSize - 1);
    const contentLength = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${audioSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "audio/mp3",
    };

    const stream = yt.stream_audio({
      quality: "highestaudio",
      range: { start, end },
    });

    res.writeHead(206, headers);
    stream.pipe(res);
  } catch (error) {
    res.status(500).send("something went wrong");
  }
};

export const streamVideo = async (req, res) => {
  try {
    const range = req.headers.range;
    if (!range) return res.status(400).send("error");

    const videoId = req.params.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const yt = new YoutubeVideo(videoUrl);

    const { stream, size: videoSize } = await yt.stream_video({
      range: { start, end },
    });

    const chunkSize = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, videoSize - 1);
    const contentLength = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    stream.pipe(res);
  } catch (error) {
    res.status(500).send("something went wrong");
  }
};
