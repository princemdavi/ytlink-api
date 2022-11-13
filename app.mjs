import express from "express";
import cors from "cors";
import drive, { uploadFile } from "./gdrive.mjs";
import File from "./model/file.mjs";
import database from "./database.mjs";
import YoutubeVideo from "./youtubevideo.mjs";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = "https://pytvdd.herokuapp.com";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello bro");
});

app.get("/download", async (req, res) => {
  try {
    const fileId = req.query.file;

    if (!fileId) return res.status(400).json({ msg: "file is needed" });

    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ msg: "not found" });

    const title = file.title
      .replace(/[-&\/\\#, +()$~%.'":*?<>{}]/g, " ")
      .trim();

    res.set({
      "Content-Length": file.file_size,
      "Content-Disposition": `attachment; filename=ydloder.tk - ${title}.${file.ext}`,
    });

    const resp = await drive.files.get(
      {
        fileId: file.file_id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    resp.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

app.get("/audio/:videoId", async (req, res) => {
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

  const stream = yt.stream({ quality: "highestaudio", range: { start, end } });

  res.writeHead(206, headers);
  stream.pipe(res);
});

app.get("/video/:videoId", async (req, res) => {
  const range = req.headers.range;
  if (!range) return res.status(400).send("error");

  const videoId = req.params.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const yt = new YoutubeVideo(videoUrl);

  const videoSize = await yt.getSize({ quality: "highestvideo" });
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

  const stream = yt.stream({
    quality: "lowestvideo",
    range: { start, end },
  });

  res.writeHead(206, headers);
  stream.pipe(res);
});

app.get("/download/audio/:videoId", async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const file = await File.findOne({ video_id: videoId, file_type: "audio" });

    if (file) {
      res.status(200).send(`${server}/file?file=${file.file_id}`);
      return;
    }

    const yt = new YoutubeVideo(`https://www.youtube.com/watch?v=${videoId}`);
    const { audioStream, title } = await yt.download_audio();

    let file_size = 0;

    audioStream.on("data", (chunk) => {
      file_size += chunk.length;
    });

    const file_id = await uploadFile({
      stream: audioStream,
      mimeType: "audio/mp3",
      name: uuidv4() + ".mp3",
    });

    const newFile = await File.create({
      title,
      video_id: videoId,
      file_id,
      file_size,
      file_type: "audio",
    });

    res.status(200).send(`${server}/file?file=${newFile._id}`);
  } catch (error) {
    res.status(500).json({ msg: "something went wrong" });
  }
});

app.get("/download/video/:videoId/:itag", async (req, res) => {
  try {
    const { videoId, itag } = req.params;

    const file = await File.findOne({ video_id: videoId, itag });

    if (file) {
      res.status(200).send(`${server}/file?file=${file.file_id}`);
      return;
    }

    const yt = new YoutubeVideo(`https://www.youtube.com/watch?v=${videoId}`);
    const { videoStream, title } = await yt.download_video(itag);

    let file_size = 0;

    videoStream.on("data", (chunk) => {
      file_size += chunk.length;
    });

    const file_id = await uploadFile({
      stream: videoStream,
      mimeType: "video/mp4",
      name: uuidv4() + ".mp4",
    });

    const newFile = await File.create({
      title,
      video_id: videoId,
      file_id,
      itag,
      file_size,
      file_type: "video",
    });

    res.status(200).send(`${server}/file?file=${newFile._id}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("something went wrong");
  }
});

app.get("/file", async (req, res) => {
  try {
    const fileId = req.query.file;

    if (!fileId) return res.status(400).json({ msg: "file is needed" });

    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ msg: "not found" });
    const title = file.title
      .replace(/[-&\/\\#, +()$~%.'":*?<>{}]/g, " ")
      .trim();
    const ext = file.file_type == "audio" ? ".mp3" : ".mp4";

    const resp = await drive.files.get(
      {
        fileId: file.file_id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    res.set({
      "Content-Length": file.file_size,
      "Content-Disposition": `attachment; filename=${title}${ext}`,
    });

    resp.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(process.env.PORT || 5000, async () => {
  console.log("server running...");
  try {
    await database();
    console.log("connected to db successfully");
  } catch (error) {
    console.log("something went wrong");
  }
});
