import express from "express";
import { audio, video } from "../controllers/stream.mjs";

const router = express.Router();

router.get("/audio", audio);
router.get("/video", video);

export default router;
