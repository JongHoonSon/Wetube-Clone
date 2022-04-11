import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 80 },
  description: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  fileUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0, trim: true },
    rating: { type: Number, required: true, default: 0, trim: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  likeUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
  ],
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
