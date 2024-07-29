import express from "express";
import comments from "../models/comment.js";
const showcomments = express.Router();
showcomments.get("/:id", async (req, res) => {
  try {
    const comms = await comments
      .find({
        postId: req.params.id,
        parentId: null,
      })
      .sort({ createdAt: -1 });

    res.status(200).send(comms);
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default showcomments;
