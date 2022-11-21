import YoutubeVideo from "../youtubevideo.mjs";

export const videoInfo = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const format = req.params.format ? req.params.format : "mp4";
    const yt = new YoutubeVideo(videoId);
    const videoInfo = await yt.get_video_info(format);
    res.status(200).json(videoInfo);
  } catch (error) {
    res.status(500).send(error);
  }
};
