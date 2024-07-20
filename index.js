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
app.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Search for posts where the maintitle or description matches the query
    const searchResults = await posts.find({
      $or: [
        { maintitle: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).send(searchResults);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while searching" });
  }
});

app.get("/blog", async (req, res) => {
  try {
    const Latestpost = await posts.find({}).sort({ createdAt: -1 }).limit(10);
    const Popularpost = await posts.find({}).sort({ views: -1 }).limit(10);
    const Trending = await posts
      .find({})
      .sort({ likes: -1, views: -1 })
      .limit(10);

    res.status(200).send({ Latestpost, Popularpost, Trending });
  } catch (err) {
    res.status(500).send(err.message);
  }
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

app.get("/isAuthenticated", async (req, res) => {
  console.log("hello");
  if (req.user) res.status(200).send(req.user);
});

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
  try {
    const blogcnt = JSON.parse(req.body.blogcnt);
    console.log(req.user);
    const date = new Date();
    const createdAt = date.toLocaleDateString();
    const post = new posts({
      maintitle: req.body.maintitle,
      description: req.body.description,
      content: blogcnt,
      image: req.file.filename,
      author: req.user.name,
      createdAt: createdAt,
    });

    await post.save();
    res.status(200).send(post._id);
  } catch (err) {
    res.status(500).send("error occured while uploading ");
  }
});
app.get("/dashboard", async (req, res) => {
  console.log(req.user.name);
  const username = req.user.name;
  var userdata;
  const latestcomment = await comments
    .find({ postAuthor: req.user.name })
    .sort({ createdAt: -1 })
    .limit(10);
  console.log(latestcomment);
  try {
    const result = await posts.aggregate([
      {
        $match: { author: username },
      },
      {
        $group: {
          _id: "$author",
          totalViews: { $sum: "$views" },
          totalComments: { $sum: "$comments" },
          totalLikes: { $sum: "$likes" },
        },
      },
    ]);

    if (result.length > 0) {
      userdata = result[0];
    } else {
      userdata = {
        totalViews: 0,
        totalComments: 0,
        totalLikes: 0,
      };
    }
  } catch (error) {
    console.error("Error aggregating user blog stats:", error);
  }
  console.log(userdata);
  res.status(200).send({ latestcomment, username, userdata });
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
  const date = new Date();
  const createdAt = date.toLocaleDateString();
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
});
app.post("/reply", async (req, res) => {
  const content = req.body.commreply;
  const post_id = req.body.blog_id;
  const user_id = req.user.id;
  const date = new Date();
  const commentid = req.body.commentid;
  const createdAt = date.toLocaleDateString();
  const parentcomment = await comments.findOne({ _id: commentid });
  var parentId;
  if (parentcomment.parentId == null) parentId = commentid;
  else parentId = parentcomment.parentId;

  console.log(user_id);
  try {
    const comment = new comments({
      postId: post_id,
      userId: user_id,
      username: req.user.name,
      content: content,
      parentId: parentId,
      createdAt: createdAt,
      parentUsername: req.body.parentUsername,
    });

    await comment.save();
    res.status(200).send(comment);
  } catch (err) {
    res.send(500).send("internal server error");
  }
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
