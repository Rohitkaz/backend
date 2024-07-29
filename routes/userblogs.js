import express from "express";

import verifyJWT from "../middlewares/verifyJWT.js";
import posts from "../models/post.js";
const userblogs = express.Router();
userblogs.use(verifyJWT);
userblogs.get("", async (req, res) => {
  const author = req.user.name;
  try {
    const post = await posts.find({ author: author });
    res.status(200).send(post);
  } catch (err) {
    res.status(500).send("internal server error");
  }
});
export default userblogs;
