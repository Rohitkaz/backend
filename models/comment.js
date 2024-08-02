import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  userId: { type: String, required: true },
  postAuthor: { type: String, default: null },
  username: { type: String, required: true },
  content: { type: String, required: true },
  parentId: { type: String, default: null },
  Repliedto: { type: String, default: null },
  Repliedtoid: { type: String, default: null },
  likedby: { type: Array },
  likes: { type: Number, default: 0 },
  createdAt: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

//CommentSchema.index({ postId: 1 });
// CommentSchema.index({ parentId: 1 });

const comments = mongoose.model("Comment", CommentSchema);
export default comments;
