import express from "express";
import router from "./middlewares/router.js";
import connect from "./middlewares/db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import posts from "./models/post.js";
import multer from "multer";
import Auth from "./middlewares/Auth.js";
//import users from "./models/users.js";
//import bcrypt from "bcrypt";

import cookieParser from "cookie-parser";
import comments from "./models/comment.js";
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
import contentschema from "./models/contentschema.js";
import verifyJWT from "./middlewares/verifyJWT.js";
import verifycookie from "./middlewares/Verifycookie.js";
import Engagement from "./models/Bloglikesandviews.js";

//app.use("/", router);
app.use(
  cors({
    origin: "https://blogfrontend-theta.vercel.app",
    credentials: true,
  })
);
app.use("/images", express.static("uploads"));
app.use("/Auth", Auth);
//app.use("/blog", Sendblog);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
    console.log(req.body);
  },
});
const upload = multer({ storage: storage });

app.get("/blog", async (req, res) => {
  const post = await posts.find({});
  res.status(200).send(post);
});
//app.use(verifyCookie);

app.get("/showcomments/:id", async (req, res) => {
  const comms = await comments.find({ postId: req.params.id, parentId: null });

  res.status(200).send(comms);
});
app.get("/showreplies/:id/:replyid", async (req, res) => {
  console.log("hello");

  const comms = await comments.find({
    postId: req.params.id,
    parentId: req.params.replyid,
  });

  console.log(comms);
  res.status(200).send(comms);
});
app.use(verifycookie);
app.get("/blog/:id", async (req, res) => {
  if (req.user) {
    console.log("hi");
    const user = await Engagement.findOne({
      userId: req.user.id,
      postId: req.params.id,
    });

    const view = true;
    console.log(user);
    if (!user) {
      const userEngagement = new Engagement({
        postId: req.params.id,
        userId: req.user.id,
        views: view,
      });

      await userEngagement.save();
      const blog = await posts.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { views: 1 } }
      );
    } else {
      console.log("finallissds");
      if (user.views == false) {
        const blog = await posts.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { views: 1 } }
        );
        const engagement = await Engagement.findOneAndUpdate(
          { userId: req.user.id, postId: req.params.id },
          { views: view }
        );
      }
    }
  } else {
    const viewedblogs = req.viewedblogs;

    if (!viewedblogs.includes(req.params.id)) {
      console.log("this is it");
      viewedblogs.push(req.params.id);

      const blog = await posts.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { views: 1 } }
      );
      const userIdentifier = jwt.sign(
        JSON.stringify(viewedblogs),
        process.env.ACCESS_TOKEN_SECRET
      );
      res.cookie("userIdentifier", userIdentifier, {
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
      });
    }
  }
  var userlike = false;
  if (req.user) {
    const user1 = await Engagement.findOne({
      userId: req.user.id,
      postId: req.params.id,
    });
    userlike = user1.like;
  }
  console.log(userlike);
  const blog1 = await posts.findOne({ _id: req.params.id });
  const blog = {
    blog: blog1,
    userlike: userlike,
  };
  res.status(200).send(blog);
});

app.use(verifyJWT);

app.get("/like/:id", async (req, res) => {
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
});
app.get("/dislike/:id", async (req, res) => {
  console.log("dislike");
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
});
app.post("/newblog", upload.single("image"), async function (req, res, next) {
  const blogcnt = JSON.parse(req.body.blogcnt);
  console.log(req.user);
  const post = new posts({
    maintitle: req.body.maintitle,
    description: req.body.description,
    content: blogcnt,
    image: req.file.filename,
    author: req.user.name,
  });
  await post.save();
});
app.get("/dashboard", async (req, res) => {
  console.log(req.user.name);
  const latestcomment = await comments
    .find({ postAuthor: req.user.name })
    .sort({ createdAt: -1 })
    .limit(10);
  console.log(latestcomment);
  res.status(200).send(latestcomment);
});
app.get("/yourblog", async (req, res) => {
  const author = req.user.name;
  const post = await posts.find({ author: author });
  res.status(200).send(post);
});
app.post("/comment", async (req, res) => {
  console.log("hi");

  const content = req.body.comment;
  const post_id = req.body.blog_id;
  const user_id = req.user.id;

  const comment = new comments({
    postId: post_id,
    userId: user_id,
    username: req.user.name,
    content: content,
    postAuthor: req.body.blogauthor,
  });
  const blog = await posts.findOneAndUpdate(
    { _id: req.body.blog_id },
    { $inc: { comments: 1 } }
  );
  await comment.save();
  res.status(200).send(comment);
});
app.post("/reply", async (req, res) => {
  const content = req.body.commreply;
  const post_id = req.body.blog_id;
  const user_id = req.user.id;

  const parentId = req.body.commentid;
  console.log(user_id);
  const comment = new comments({
    postId: post_id,
    userId: user_id,
    username: req.user.name,
    content: content,
    parentId: parentId,
  });

  await comment.save();
  res.status(200).send(comment);
});
app.post("/likecomments", async (req, res) => {
  const user_id = req.user.id;

  const commentId = req.body.commentid;
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
  return res.status(400);
});
connect().then(() => {
  app.listen(8000, () => {
    console.log("listening for requests");
  });
});
