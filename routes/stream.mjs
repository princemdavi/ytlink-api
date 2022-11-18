import express from "express";
import { streamAudio, streamVideo } from "../controllers/stream.mjs";

const router = express.Router();

router.get("/audio/:videoId", streamAudio);
router.get("/video/:videoId", streamVideo);

export default router;
