import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import { async } from "regenerator-runtime";
import { S3 } from "aws-sdk";
import { s3 } from "../middlewares";

const A3_BUCKET_NAME = "jh-wetube";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watchVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: { path: "owner", select: "username" },
    });
  if (!video) {
    req.flash("error", "Video not found.");
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("videos/watch", { pageTitle: video.title, video });
};

export const getVideoEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    req.flash("error", "Video not found.");
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the the owner of the video.");
    return res.status(403).redirect("/");
  }
  return res.render("videos/edit", {
    pageTitle: `Edit: ${video.title}`,
    video,
  });
};

export const postVideoEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const newThumb = req.files.thumb;
  const { title, description, hashtags } = req.body;

  const video = await Video.findById(id).populate("owner");
  if (!video) {
    req.flash("error", "Video not found.");
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner._id) !== String(_id)) {
    req.flash("error", "You are not the the owner of the video.");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
    thumbUrl: newThumb
      ? res.locals.isHeroku
        ? newThumb[0].location
        : newThumb[0].path
      : video.thumbUrl,
  });
  if (newThumb && res.locals.isHeroku) {
    deleteFileFromS3(A3_BUCKET_NAME, "videos/", video.thumbUrl);
  }
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getVideoUpload = (req, res) => {
  return res.render("videos/upload", { pageTitle: "Upload Video" });
};

export const postVideoUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: res.locals.isHeroku ? video[0].location : video[0].path,
      thumbUrl: res.locals.isHeroku ? thumb[0].location : thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.uploadVideos.push(newVideo._id);
    user.save();
    req.flash("success", "Upload succeed.");
    return res.redirect("/");
  } catch (error) {
    req.flash("error", "Upload failed.");
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id).populate();
  if (!video) {
    req.flash("error", "Video not found.");
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video.");
    return res.status(403).redirect("/");
  }
  const commentList = video.comments;
  commentList.forEach(async (commentObject) => {
    await Comment.findByIdAndDelete(String(commentObject));
  });

  await Video.findByIdAndDelete(id);

  if (res.locals.isHeroku) {
    deleteFileFromS3(A3_BUCKET_NAME, "videos/", video.fileUrl);
    deleteFileFromS3(A3_BUCKET_NAME, "videos/", video.thumbUrl);
  }

  req.flash("success", "Delete succeed.");
  return res.redirect("/");
};

const deleteFileFromS3 = (bucketName, filePath, fileUrl) => {
  const delfileUrl = fileUrl.split("/");
  const delFileName = filePath + delfileUrl[delfileUrl.length - 1];
  s3.deleteObject(
    {
      Bucket: bucketName,
      Key: delFileName,
    },
    (err, data) => {
      if (err) {
        console.log("AWS S3 Delete obejct filed");
        console.log(err, err.stack);
        return res.redirect("/");
      } else {
        console.log("AWS S3 Delete obejct succeed");
        console.log("Object Info : " + data);
      }
    }
  );
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("videos/search", { pageTitle: "Search", videos });
};

export const registerVideoView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    req.flash("error", "Video not found.");
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const registerVideoLike = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  const loggedInUser = req.session.user;
  if (!video) {
    req.flash("error", "Video not found.");
    return res.sendStatus(404);
  }
  if (!loggedInUser) {
    console.log("please login");
    return res.status(403).redirect("/login");
  }

  const user = await User.findById(loggedInUser._id);
  if (!user) {
    req.flash("error", "User not found.");
    return res.sendStatus(404);
  }

  console.log(video);
  console.log(user);

  if (
    String(video.likeUsers).includes(String(user._id)) &&
    String(user.likeVideos).includes(String(video._id))
  ) {
    console.log("Like Canceled!!!");
    video.likeUsers = video.likeUsers.filter(
      (likeUsers) => String(likeUsers) !== String(user._id)
    );
    user.likeVideos = user.likeVideos.filter(
      (likeVideo) => String(likeVideo) !== String(video._id)
    );
  } else {
    console.log("Like Added!!!");
    video.likeUsers.push(user);
    user.likeVideos.push(video);
  }

  video.save();
  user.save();

  console.log("----after-----");

  console.log(video);
  console.log(user);

  return res.status(200).redirect(`/videos/${id}`);
};
