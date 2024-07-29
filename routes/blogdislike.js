import express from "express";
import comments from "../models/comment.js";
const blogdislike = express.Router();
import verifyJWT from "../middlewares/verifyJWT.js";
import Engagement from "../models/Bloglikesandviews.js";
import posts from "../models/post.js";
blogdislike.use(verifyJWT);

blogdislike.get("/:id", async (req, res) => {
  console.log("dislike");
  try {
    const user = await Engagement.findOne({
      userId: req.user.id,
      postId: req.params.id,
    });
    const like = false;

    if (user.like == true) {
      const blog = await posts.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { likes: -1 } }
      );

      const engagement = await Engagement.findOneAndUpdate(
        { userId: req.user.id, postId: req.params.id },
        { like: like }
      );
      res.status(200).send(blog);
    }
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default blogdislike;
