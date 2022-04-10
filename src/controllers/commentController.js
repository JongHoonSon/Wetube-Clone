import { async } from "regenerator-runtime";
import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";

export const createComment = async (req, res) => {
  // 누군가 POST 요청을 할 경우, 쿠키에 유저 정보가 담겨서 같이 오고,
  // 우리는 session 미들웨어를 사용하기 때문에 그 정보를 req.session.user 에서 찾을 수 있다.
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });

  video.comments.push(comment._id);
  video.save();

  const commentUser = await User.findById(user._id);

  commentUser.comments.push(comment._id);
  commentUser.save();

  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  const comment = await Comment.findById(id).populate("owner");

  if (!comment) {
    return res.sendStatus(404);
  }

  const commentOwnerId = String(comment.owner._id);
  const commentVideoId = String(comment.video._id);

  if (commentOwnerId !== user._id) {
    return res.sendStatus(403);
  }

  // Comment 삭제
  await Comment.findByIdAndDelete(id);

  // User의 comments에서 삭제
  const commentOwner = await User.findById(commentOwnerId);
  commentOwner.comments = commentOwner.comments.filter(function (item) {
    return String(item) !== id;
    // return String(item) === "1";
  });
  commentOwner.save();

  // Video의 comments에서 삭제
  const commentVideo = await Video.findById(commentVideoId);
  commentVideo.comments = commentVideo.comments.filter(function (item) {
    return String(item) !== id;
    // return String(item) === "1";
  });
  commentVideo.save();

  return res.sendStatus(200);
};

export const updateComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  console.log("user", user);
  console.log("text", text);
  console.log("id", id);

  const comment = await Comment.findById(id).populate("owner");

  if (!comment) {
    return res.sendStatus(404);
  }

  const commentOwnerId = String(comment.owner._id);

  if (commentOwnerId !== user._id) {
    return res.sendStatus(403);
  }

  await Comment.findByIdAndUpdate(id, { text });

  return res.sendStatus(200);
};
