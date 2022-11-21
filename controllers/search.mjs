import yts from "yt-search";

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
