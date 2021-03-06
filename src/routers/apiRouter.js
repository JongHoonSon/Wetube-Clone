import express from "express";
import { registerVideoView } from "../controllers/videoController";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/commentController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerVideoView);
apiRouter.post("/comments/:id([0-9a-f]{24})/create", createComment);
apiRouter.delete("/comments/:id([0-9a-f]{24})/delete", deleteComment);
apiRouter.post("/comments/:id([0-9a-f]{24})/update", updateComment);

export default apiRouter;
