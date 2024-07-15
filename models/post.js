import mongoose from "mongoose";
import contentschema from "./contentschema.js";
const postSchema = new mongoose.Schema({
  maintitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },

  content: {
    type: [contentschema],
  },

  image: {
    type: String,
  },

  author: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
  },
});
const posts = new mongoose.model("posts", postSchema);
export default posts;
