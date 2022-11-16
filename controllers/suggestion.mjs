import util from "util";
import suggestion from "suggestion";

export const suggestions = async (req, res) => {
  try {
    const term = req.query.term;
    if (!term) return res.status(403).json({ msg: "search term is required" });
    const getSuggestions = util.promisify(suggestion);
    const fetchedSuggestions = await getSuggestions(term, {
      client: "youtube",
    });
    res.status(200).json(fetchedSuggestions);
  } catch (error) {
    res.status(500).send("something went wrong");
  }
};
