import express from "express";
import verifycookie from "../middlewares/Verifycookie.js";
import posts from "../models/post.js";
import Engagement from "../models/Bloglikesandviews.js";
import cookieParser from "cookie-parser";

import jwt from "jsonwebtoken";
import { getCachedBlogs } from "../cache/cache.js";
const blog = express.Router();
blog.get("", async (req, res) => {
  try {
    console.log("hi")
    const blogs = await getCachedBlogs();
    console.log(blogs);
    res.set({ "Cache-Control": "max-age=600" });
    

    res.status(200).send(blogs);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
blog.use(verifycookie);
blog.get("/:id", async (req, res) => {
  console.log(req.user);
  try {
    
    const blog1 = await posts.findOne({ _id: req.params.id });
    const blog = {
      blog: blog1,
    };
  
    res.set({ "Cache-Control": "max-age=600" });
    console.log("i am here");
    res.status(200).send(blog);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("internal server error");
  }
});
blog.get("/:id/views", async (req, res) => {
  
  console.log(req.user);
 try {
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
          { $inc: { views: 1 } },
         
        );
        
      } else {
        console.log("finallissds");
        if (user.views == false) {
          const blog = await posts.findOneAndUpdate(
            { _id: req.params.id },
            { $inc: { views: 1 } },
           
          );
          const engagement = await Engagement.findOneAndUpdate(
            { userId: req.user.id, postId: req.params.id },
            { views: view }
          );
        }
      }
      
    } else {
      console.log("here");
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
    const blog=await posts.findOne({ _id: req.params.id });

    const engagement={views:blog.views,likes:blog.likes,comments:blog.comments,userlike:userlike}
    
    res.status(200).send(engagement);
  
}catch(err)
{
  console.log(err);
  res.status(500).send("internal server error");
}
}
  
);

export default blog;
