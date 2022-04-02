import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import { async } from "regenerator-runtime";


export const home = async(req, res) => {
    const videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate("owner");
    return res.render("home", {pageTitle: "Home", videos});
};

export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    return res.render("videos/watch", {pageTitle: video.title, video });
}

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id }
    } = req.session;
    const video = await Video.findById(id);
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if(String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("videos/edit", {pageTitle: `Edit: ${video.title}`, video});
}

export const postEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id }
    } = req.session;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({ _id: id });
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if(String(video.owner) !== String(_id)) {
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

export const getUpload = (req, res) => {
    return res.render("videos/upload", { pageTitle: "Upload Video" });
};
  
export const postUpload = async (req, res) => {
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
        return res.status(400).render("videos/upload", { pageTitle: "Upload Video", errorMessage: error._message });
    }
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id }
    } = req.session;
    const video = await Video.findById(id);
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if(String(video.owner) !== String(_id)) {
        req.flash("error", "You are not the owner of the video.");
        return res.status(403).redirect("/");
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

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
}

export const createComment = async (req, res) => {
    // 누군가 POST 요청을 할 경우, 쿠키에 유저 정보가 담겨서 같이 오고,
    // 우리는 session 미들웨어를 사용하기 때문에 그 정보를 req.session.user 에서 찾을 수 있다.
    const { 
        session: { user },
        body: { text },
        params: { id }
    } = req;

    const video = await Video.findById(id);

    if(!video) {
        return res.sendStatus(404);
    }

    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id
    })

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

    if(!comment) {
        return res.sendStatus(404);
    }

    const commentOwnerId = String(comment.owner._id);
    const commentVideoId = String(comment.video._id);

    if(commentOwnerId !== user._id) {
        return res.sendStatus(403);
    }

    // Comment 삭제
    await Comment.findByIdAndDelete(id);
    
    // User의 comments에서 삭제
    const commentOwner = await User.findById(commentOwnerId);
    commentOwner.comments = commentOwner.comments.filter(function(item) {
        return String(item) !== id; 
        // return String(item) === "1"; 
    });
    commentOwner.save();
    
    // Video의 comments에서 삭제
    const commentVideo = await Video.findById(commentVideoId);
    commentVideo.comments = commentVideo.comments.filter(function(item) {
        return String(item) !== id; 
        // return String(item) === "1"; 
    });
    commentVideo.save();

    return res.sendStatus(200);
}