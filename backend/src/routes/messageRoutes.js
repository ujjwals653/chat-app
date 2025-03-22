import express from "express";
import { sendMessage, getMessages, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/", getMessages);
router.post("/delete", deleteMessage);

export default router;