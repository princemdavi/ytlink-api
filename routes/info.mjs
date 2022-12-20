import express from "express";
import { videoInfo, playlistInfo } from "../controllers/info.mjs";

const router = express.Router();

router.get("/video/:videoId", videoInfo);
router.get("/playlist/:playlistId", playlistInfo);

export default router;
