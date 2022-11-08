import path from "path";
import express from "express";
import cors from "cors";
import drive from "./gdrive.mjs";
import File from "./model/file.mjs";
import database from "./database.mjs";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello bro");
});

app.get("/download", async (req, res) => {
  try {
    const fileId = req.query.file;

    if (!fileId) return res.status(400).json({ msg: "file is needed" });

    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ msg: "not found" });

    const title = file.title.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, " ");

    res.set({
      "Content-Length": file.file_size,
      "Content-Disposition": `attachment; filename=ydloder.tk - ${title}.${file.ext}`,
    });

    const resp = await drive.files.get(
      {
        fileId: file.file_id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    resp.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

app.listen(process.env.PORT || 5000, async () => {
  console.log("server running...");
  try {
    await database();
    console.log("connected to db successfully");
  } catch (error) {
    console.log("something went wrong");
  }
});
