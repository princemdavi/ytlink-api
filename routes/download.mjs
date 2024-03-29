import express from "express";
import { downloadFile, getDownloadedFile } from "../controllers/download.mjs";

const router = express.Router();

router.get("/", getDownloadedFile);
router.get("/:videoId/:itag/:format", downloadFile);

export default router;
