import ytsr from "ytsr";

export const searchVideo = async (req, res) => {
  try {
    const term = req.query.term;
    if (!term)
      return res.status(400).json({ details: "search term is needed" });

    const result = await ytsr.getFilters(term);
    const filters = result.get("Type").get("Video");
    const searchResults = await ytsr(filters.url, { pages: 1 });

    res.status(200).json(searchResults.items);
  } catch (error) {
    res.status(500).json({ msg: "something went wrong" });
  }
};
