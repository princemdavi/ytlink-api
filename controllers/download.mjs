import { v4 as uuidv4 } from "uuid";
import YoutubeVideo from "../youtubevideo.mjs";
import File from "../model/file.mjs";
import drive, { uploadFile } from "../gdrive.mjs";

const server = "https://pytvdd.herokuapp.com";

export const audio = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const file = await File.findOne({ video_id: videoId, file_type: "audio" });

    if (file) {
      res.status(200).send(`${server}/download?file=${file._id}`);
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

    res.status(200).send(`${server}/download?file=${newFile._id}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "something went wrong" });
  }
};

export const video = async (req, res) => {
  try {
    const { videoId, itag } = req.params;
    //! we check if the file requested has already been downloadeda and if so, we just return it
    const file = await File.findOne({ video_id: videoId, itag });

    if (file) {
      res.status(200).send(`${server}/download?file=${file._id}`);
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

    res.status(200).send(`${server}/download?file=${newFile._id}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("something went wrong");
  }
};

export const file = async (req, res) => {
  try {
    const fileId = req.query.file;

    if (!fileId) return res.status(400).json({ msg: "file is needed" });

    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ msg: "not found" });

    const ext = file.file_type == "audio" ? ".mp3" : ".mp4";
    const title =
      file.title.replace(/[-&\/\\#, +()$~%.'":*?<>{}]/g, " ").trim() + ext;

    const resp = await drive.files.get(
      {
        fileId: file.file_id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    res.set({
      "Content-Length": file.file_size,
      "Content-Disposition": `attachment; filename=${title}`,
    });

    resp.data.pipe(res);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("something went wrong");
  }
};
