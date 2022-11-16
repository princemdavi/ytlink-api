import express from "express";
import cors from "cors";
import database from "./database.mjs";
import streamRoutes from "./routes/stream.mjs";
import downloadRoutes from "./routes/download.mjs";
import suggestionRoute from "./routes/suggestion.mjs";
import searchRoute from "./routes/search.mjs";

const app = express();

app.use(cors());
app.use(express.json());

// middlewares
app.use("/stream", streamRoutes);
app.use("/download", downloadRoutes);
app.use("/suggestion", suggestionRoute);
app.use("/search", searchRoute);

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
