import yts from "yt-search";
import YoutubeVideo from "../youtubevideo.mjs";

export const videoInfo = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const yt = new YoutubeVideo(videoId);
    const videoInfo = await yt.get_video_info();
    res.status(200).json(videoInfo);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const playlistInfo = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const list = await yts({ listId: playlistId });
    return res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ msg: "something went wrong" });
  }
};
