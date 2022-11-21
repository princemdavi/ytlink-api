import express from "express";
import { videoInfo } from "../controllers/videoinfo.mjs";

const router = express.Router();

router.get("/:videoId/:format", videoInfo);

export default router;
