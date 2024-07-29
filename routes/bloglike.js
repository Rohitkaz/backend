import express from "express";
import comments from "../models/comment.js";
const bloglike = express.Router();
import verifyJWT from "../middlewares/verifyJWT.js";
import Engagement from "../models/Bloglikesandviews.js";
import posts from "../models/post.js";
bloglike.use(verifyJWT);
bloglike.get("/:id", async (req, res) => {
  try {
    console.log("like");
    const user = await Engagement.findOne({
      userId: req.user.id,
      postId: req.params.id,
    });
    const like = true;

    if (user.like == false) {
      const blog = await posts.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { likes: 1 } }
      );
      console.log(blog.likes);
      const engagement = await Engagement.findOneAndUpdate(
        { userId: req.user.id, postId: req.params.id },
        { like: like }
      );
      console.log(false);
      res.status(200).send(blog);
    }
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default bloglike;
