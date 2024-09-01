import express from "express";

const newblog = express.Router();
import verifyJWT from "../middlewares/verifyJWT.js";
import multer from "multer";
import posts from "../models/post.js";
newblog.use(verifyJWT);
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
newblog.post("", upload.single("image"), async function (req, res, next) {
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
      authorId:req.user.id,
      createdAt: createdAt,
    });

    await post.save();
    res.status(200).send(post._id);
  } catch (err) {
    res.status(500).send("error occured while uploading ");
  }
});
export default newblog;
