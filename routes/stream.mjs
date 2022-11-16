import express from "express";
import { audio, video } from "../controllers/stream.mjs";

const router = express.Router();

router.get("/audio/:videoId", audio);
router.get("/video/:videoId", video);

export default router;
