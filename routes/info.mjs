import express from "express";
import { audioInfo, videoInfo, playlistInfo } from "../controllers/info.mjs";

const router = express.Router();

router.get("/video/:videoId/:format", videoInfo);
router.get("/audio/:videoId/", audioInfo);
router.get("/playlist/:playlistId", playlistInfo);

export default router;
