import express from "express";
import cors from "cors";
import database from "./database.mjs";
import {
  downloadRoute,
  searchRoute,
  streamRoute,
  suggestionRoute,
  infoRoute,
} from "./routes/index.mjs";

const app = express();

app.use(
  cors({
    origin: ["https://ytlink.tk", "https://www.ytlink.tk"],
  })
);
app.use(express.json());

// middlewares
app.use("/stream", streamRoute);
app.use("/download", downloadRoute);
app.use("/suggestion", suggestionRoute);
app.use("/search", searchRoute);
app.use("/info", infoRoute);

app.get("/", (req, res) => {
  res.send("hello bro");
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
