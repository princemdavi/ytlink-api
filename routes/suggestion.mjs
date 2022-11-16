import express from "express";
import { suggestions } from "../controllers/suggestion.mjs";

const router = express.Router();

router.get("/", suggestions);

export default router;
