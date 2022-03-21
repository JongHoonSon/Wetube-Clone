import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 80 },
    description: { type: String, required: true, minlength: 20 },
    createdAt: { type: Date, required: true, default: Date.now},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true,  default: 0, trim: true },
        rating: { type: Number, required: true,  default: 0, trim: true },
    },
});

videoSchema.pre('save', async function() {
    this.hashtags = this.hashtags[0].split(",").map(word => word.startsWith("#") ? word : `#${word}`);
    console.log(this);
});

const Video = mongoose.model("Video", videoSchema);
export default Video;