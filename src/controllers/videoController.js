import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import { async } from "regenerator-runtime";
import { S3 } from "aws-sdk";
import { s3 } from "../middlewares";


export const home = async(req, res) => {
    const videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate("owner");
    return res.render("home", {pageTitle: "Home", videos});
};

export const watchVideo = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if(!video) {
        req.flash("error", "Video not found.");
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    return res.render("videos/watch", {pageTitle: video.title, video });
}

export const getVideoEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id }
    } = req.session;
    const video = await Video.findById(id);
    if(!video) {
        req.flash("error", "Video not found.");
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if(String(video.owner) !== String(_id)) {
        req.flash("error", "You are not the the owner of the video.");
        return res.status(403).redirect("/");
    }
    return res.render("videos/edit", {pageTitle: `Edit: ${video.title}`, video});
}

export const postVideoEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id }
    } = req.session;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({ _id: id }).populate("owner");
    if(!video) {
        req.flash("error", "Video not found.");
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if(String(video.owner._id) !== String(_id)) {
        req.flash("error", "You are not the the owner of the video.");
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags:Video.formatHashtags(hashtags),
    });
    req.flash("success", "Changes saved.")
    return res.redirect(`/videos/${id}`);
}

export const getVideoUpload = (req, res) => {
    return res.render("videos/upload", { pageTitle: "Upload Video" });
};
  
export const postVideoUpload = async (req, res) => {
    const {
        user: {_id}
    } = req.session;
    const { video, thumb } = req.files;
    const { title, description, hashtags } = req.body;
    const isHeroku = process.env.NODE_ENV === "production";
    console.log(video);
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: isHeroku ? video[0].location : video[0].path,
            thumbUrl: isHeroku ? thumb[0].location : thumb[0].path,
            owner: _id,
            hashtags:Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch(error) {
        req.flash("error", "Upload failed.");
        return res.status(400).render("videos/upload", { pageTitle: "Upload Video", errorMessage: error._message });
    }
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id }
    } = req.session;
    const video = await Video.findById(id).populate();
    if(!video) {
        req.flash("error", "Video not found.");
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if(String(video.owner) !== String(_id)) {
        req.flash("error", "You are not the owner of the video.");
        return res.status(403).redirect("/");
    }
    console.log(video.comments);
    const commentList = video.comments;
    commentList.forEach(async commentObject => {
        console.log(String(commentObject));
        await Comment.findByIdAndDelete(String(commentObject));
    });

    if(res.locals.isHeroku) {
        const videoUrl = video.fileUrl.split('/');
        console.log("videoUrl", videoUrl);
        const delFileName = url[url.length - 1];
        console.log("delFileName", delFileName);
        const params = {
            Bucket: 'jh-wetube/videos',
            key: delFileName
        }
        s3.deleteObject(params, function(err, data) {
            if(err) {
                console.log('aws video delete error');
                console.log(err, err.stack);
                return res.redirect('/');
            } else {
                console.log('aws video delete success' + data);
            }
        })
    }

    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if(keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i")
            },
        }).populate("owner");;
    }
    return res.render("videos/search", { pageTitle: "Search", videos });
}

export const registerVideoView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video) {
        req.flash("error", "Video not found.");
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
}