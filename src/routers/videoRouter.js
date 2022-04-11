import express from "express";
import {
  watchVideo,
  getVideoEdit,
  postVideoEdit,
  getVideoUpload,
  postVideoUpload,
  deleteVideo,
  registerVideoLike,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getVideoUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxcount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postVideoUpload
  );
videoRouter.get("/:id([0-9a-f]{24})", watchVideo);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getVideoEdit)
  .post(videoUpload.fields([{ name: "thumb", maxCount: 1 }]), postVideoEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .all(protectorMiddleware)
  .post("/:id([0-9a-f]{24})/like", registerVideoLike);

export default videoRouter;
