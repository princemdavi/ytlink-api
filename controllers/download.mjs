import { v4 as uuidv4 } from "uuid";
import YoutubeVideo from "../youtubevideo.mjs";
import File from "../model/file.mjs";
import drive, { uploadFile } from "../gdrive.mjs";

const server = "https://pytvdd.herokuapp.com";

export const downloadFile = async (req, res) => {
  try {
    const { videoId, itag, format } = req.params;
    const file = await File.findOne({ video_id: videoId, itag });

    if (file) {
      res.status(200).send(`${server}/download?file=${file._id}`);
      return;
    }

    const yt = new YoutubeVideo(`https://www.youtube.com/watch?v=${videoId}`);
    const { stream, title } = await yt.download(itag, format);

    //! if the file requested for download is a audio file
    if (format == "mp3") {
      let file_size = 0;

      stream.on("data", (chunk) => {
        file_size += chunk.length;
      });

      const file_id = await uploadFile({
        stream,
        mimeType: "audio/mp3",
        name: uuidv4() + ".mp3",
      });

      const newFile = await File.create({
        title,
        video_id: videoId,
        file_id,
        size: file_size,
        mime_type: "audio/mp3",
        ext: format,
      });

      return res.status(200).send(`${server}/download?file=${newFile._id}`);
    }
    //! if file requested for download is a video

    let file_size = 0;

    stream.on("data", (chunk) => {
      file_size += chunk.length;
    });

    const file_id = await uploadFile({
      stream: stream,
      mimeType: `video/${format}`,
      name: uuidv4() + "." + format,
    });

    const newFile = await File.create({
      title,
      video_id: videoId,
      file_id,
      itag,
      size: file_size,
      mime_type: `video/${format}`,
      ext: format,
    });

    res.status(200).send(`${server}/download?file=${newFile._id}`);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "something went wrong" });
  }
};

export const getDownloadedFile = async (req, res) => {
  try {
    const fileId = req.query.file;

    if (!fileId) return res.status(400).json({ msg: "file is needed" });

    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ msg: "not found" });

    const title = file.title
      .replace(/[-&\/\\#, +()$~%.'":*?<>{}]/g, " ")
      .trim();

    const resp = await drive.files.get(
      {
        fileId: file.file_id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    res.set({
      "Content-Type": file.mime_type,
      "Content-Length": file.size,
      "Content-Disposition": `attachment; filename=${title}`,
    });

    resp.data.pipe(res);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("something went wrong");
  }
};
