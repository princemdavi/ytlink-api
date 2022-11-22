import express from "express";
import { audioInfo, videoInfo } from "../controllers/info.mjs";

const router = express.Router();

router.get("/video/:videoId/:format", videoInfo);
router.get("/audio/:videoId/", audioInfo);

export default router;
