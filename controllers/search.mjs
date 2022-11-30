import axios from "axios";
import yts from "yt-search";

const backend_2 = "https://pytvapp.herokuapp.com";

export const searchVideo = async (req, res) => {
  try {
    const term = req.query.term;
    if (!term)
      return res.status(400).json({ details: "search term is needed" });

    const result = await yts(term);

    res.status(200).json(result.videos);
  } catch (error) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

export const searchPlaylist = async (req, res) => {
  try {
    const term = req.query.term;
    if (!term)
      return res.status(400).json({ details: "search term is needed" });

    const { data } = await axios.get(
      `${backend_2}/search/playlists?term=${term}`
    );

    const modifield_results = data.map((result) => ({
      listId: result.id,
      title: result.title,
      videoCount: result.videoCount,
      author: result.channel,
      thumbnail: result.thumbnails.at(-1).url,
    }));

    res.status(200).json(modifield_results);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "something went wrong" });
  }
};
