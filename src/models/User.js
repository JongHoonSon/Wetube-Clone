import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: {
    type: String,
    default:
      "https://jh-wetube.s3.ap-northeast-2.amazonaws.com/default/unknown.jpg",
  },
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: { type: String },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  uploadVideos: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  ],
  likeVideos: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  ],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
