import express from "express";
import comments from "../models/comment.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import posts from "../models/post.js";
const likecomment = express.Router();
likecomment.use(verifyJWT);
likecomment.post("", async (req, res) => {
  const user_id = req.user.id;

  const commentId = req.body.commentid;
  try {
    if (req.user) {
      const comm = await comments.findOne({ _id: commentId });
      console.log(comm);

      if (!comm.likedby.includes(user_id)) {
        const result = await comments.findOneAndUpdate(
          { _id: commentId },
          { $push: { likedby: user_id }, $inc: { likes: 1 } }
        );
        return res.status(200).send("like");
      } else {
        console.log("hiha hai");
        const result = await comments.findOneAndUpdate(
          { _id: commentId },
          { $pull: { likedby: user_id }, $inc: { likes: -1 } }
        );
        return res.status(200).send("dislike");
      }
    }
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default likecomment;
