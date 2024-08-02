import express from "express";
import comments from "../models/comment.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import posts from "../models/post.js";
const reply = express.Router();
reply.use(verifyJWT);
reply.post("", async (req, res) => {
  const content = req.body.commreply;
  const post_id = req.body.blog_id;
  const user_id = req.user.id;
  const date = new Date();
  const commentid = req.body.commentid;
  const createdAt = date.toLocaleDateString();
  try {
    const parentcomment = await comments.findOne({ _id: commentid });
    var parentId;
    if (parentcomment.parentId == null) parentId = commentid;
    else parentId = parentcomment.parentId;

    console.log(user_id);

    const comment = new comments({
      postId: post_id,
      userId: user_id,
      username: req.user.name,
      content: content,
      parentId: parentId,
      createdAt: createdAt,
      Repliedto: parentcomment.username,
      Repliedtoid: commentid,
    });

    await comment.save();
    const replies = await comments.find({ parentId: parentId });

    res.status(200).send(replies);
  } catch (err) {
    res.send(500).send("internal server error");
  }
});
export default reply;
