import express from "express";
import { searchPlaylist, searchVideo } from "../controllers/search.mjs";

const router = express.Router();

router.get("/video", searchVideo);
router.get("/playlist", searchPlaylist);

export default router;
