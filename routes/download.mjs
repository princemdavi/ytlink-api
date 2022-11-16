import express from "express";
import { audio, file, video } from "../controllers/download.mjs";

const router = express.Router();

router.get("/", file);
router.get("/audio/:videoId", audio);
router.get("/video/:videoId/:itag", video);

export default router;
