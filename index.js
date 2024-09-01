import express from "express";
import router from "./middlewares/router.js";
import connect from "./middlewares/db.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import posts from "./models/post.js";
import multer from "multer";
import Auth from "./middlewares/Auth.js";

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
import blog from "./routes/blogs.js";
import search from "./routes/search.js";
import showcomments from "./routes/showcomment.js";
import showreplies from "./routes/showreplies.js";
import isAuthenticated from "./routes/isAuthenticated.js";
import bloglike from "./routes/bloglike.js";
import blogdislike from "./routes/blogdislike.js";
import newblog from "./routes/newblog.js";
import dashboard from "./routes/dashboard.js";
import userblogs from "./routes/userblogs.js";
import comment from "./routes/comment.js";
import reply from "./routes/reply.js";
import likecomment from "./routes/likecomment.js";
import deletecomment from "./routes/commentdelete.js";
import editblog from "./routes/editblog.js";


app.use(
  cors({
    origin: "https://blogfrontend-theta.vercel.app",
    credentials: true,
  })
);

app.use("/search", search);
app.use("/editblog",editblog)

app.use("/images", express.static("uploads"));
app.use("/Auth", Auth);
app.use("/blog", blog);
app.use("/showcomments", showcomments);
app.use("/showreplies", showreplies);
app.use("/isAuthenticated", isAuthenticated);
app.use("/like", bloglike);
app.use("/dislike", blogdislike);
app.use("/newblog", newblog);
app.use("/dashboard", dashboard);
app.use("/yourblog", userblogs);
app.use("/comment", comment);
app.use("/reply", reply);
app.use("/likecomments", likecomment);
app.use("/deletecomment", deletecomment);
connect().then(() => {
  app.listen(8000, () => {
    console.log("listening for requests");
  });
});
