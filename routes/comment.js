import express from "express";
import comments from "../models/comment.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import posts from "../models/post.js";
const comment = express.Router();
comment.use(verifyJWT);

comment.post("", async (req, res) => {
  console.log("hi");

  const content = req.body.comment;
  const post_id = req.body.blog_id;
  const user_id = req.user.id;
  const date = new Date();
  const createdAt = date.toLocaleDateString();
  try {
    const comment = new comments({
      postId: post_id,
      userId: user_id,
      username: req.user.name,
      content: content,
      postAuthor: req.body.blogauthor,
      createdAt: createdAt,
    });
    const blog = await posts.findOneAndUpdate(
      { _id: req.body.blog_id },
      { $inc: { comments: 1 } }
    );
    await comment.save();
    res.status(200).send(comment);
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default comment;
