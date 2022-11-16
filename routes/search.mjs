import express from "express";
import { searchVideo } from "../controllers/search.mjs";

const router = express.Router();

router.get("/", searchVideo);

export default router;
