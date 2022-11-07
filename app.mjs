import path from "path";
import express from "express";
import cors from "cors";
import drive from "./gdrive.mjs";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello bro");
});

app.get("/download", async (req, res) => {
  try {
    const fileId = req.query.file;
    const title = req.query.title;
    const size = req.query.size;

    if (!fileId || !title || !size)
      return res
        .status(400)
        .json({ msg: "file id, size and title are needed" });

    res.set({
      "Content-Length": parseInt(size),
      "Content-Disposition": `attachment; filename=${title}`,
    });

    const resp = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    resp.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(process.env.PORT || 5000, console.log("server running..."));
