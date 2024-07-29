import express from "express";
import comments from "../models/comment.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import posts from "../models/post.js";
const deletecomment = express.Router();
deletecomment.use(verifyJWT);
deletecomment.delete("/:id/:postId/:parentId", async (req, res) => {
  const commentid = req.params.id;
  const postId = req.params.postId;
  const parentId = req.params.parentId;
  console.log(parentId);
  try {
    if (parentId === "null") {
      console.log("if");
      const res = await comments.findOneAndDelete({ _id: commentid });
      const res1 = await comments.deleteMany({ parentId: commentid });

      const blog = await posts.findOneAndUpdate(
        { _id: postId },
        { $inc: { comments: -1 } }
      );
    } else {
      console.log("else");
      const res3 = await comments.findOneAndDelete({ _id: commentid });
    }
    res.status(200).send("comment successfully deleted");
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default deletecomment;
