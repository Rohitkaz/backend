import express from "express";
import comments from "../models/comment.js";
const showreplies = express.Router();
showreplies.get("/:id/:replyid", async (req, res) => {
  console.log("hello");
  try {
    const comms = await comments.find({
      postId: req.params.id,
      parentId: req.params.replyid,
    });

    console.log(comms);
    res.status(200).send(comms);
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default showreplies;
