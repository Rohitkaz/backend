import express from "express";

import verifyJWT from "../middlewares/verifyJWT.js";
import posts from "../models/post.js";
const userblogs = express.Router();
userblogs.use(verifyJWT);
userblogs.get("/:currentpage", async (req, res) => {
const currentpage=parseInt(req.params.currentpage);
console.log(currentpage);
  const authorid = req.user.id;
  try {
    const post = await posts.find({ authorId:authorid }).skip(currentpage*4).sort({_id: -1}).limit(4);
    res.status(200).send(post);
  } catch (err) {
    console.log(err);
    res.status(500).send("internal server error");
  }
});
export default userblogs;
