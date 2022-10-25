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

app.get("/file", (req, res) => {
  try {
    const fileId = req.query.file;
    const title = req.query.title;

    res.attachment(`${title}${path.extname(fileId)}`);

    drive.files
      .get({
        fileId,
        alt: "media",
      })
      .on("end", function () {
        console.log("Done");
      })
      .on("error", function (err) {
        console.log("Error during download", err);
      })
      .pipe(res);
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

app.listen(process.env.PORT || 5000, console.log("server running..."));
