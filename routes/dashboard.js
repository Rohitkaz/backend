import express from "express";
import comments from "../models/comment.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import posts from "../models/post.js";
const dashboard = express.Router();
dashboard.use(verifyJWT);

dashboard.get("", async (req, res) => {
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
          totalBlogs: { $sum: 1 },
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
        totalBlogs:0,
      };
    }
  } catch (error) {
    console.error("Error aggregating user blog stats:", error);
  }
  console.log(userdata);
  res.status(200).send({ latestcomment, username, userdata });
});
export default dashboard;
