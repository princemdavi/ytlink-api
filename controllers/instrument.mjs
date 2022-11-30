export const getInstrument = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    res.status(200).json({ msg: "everything is fine" });
  } catch (error) {
    res.status(500).json({ msg: "something went wrong" });
  }
};
