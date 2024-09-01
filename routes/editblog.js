import express from "express";

const editblog = express.Router();
import verifyJWT from "../middlewares/verifyJWT.js";
import multer from "multer";
import posts from "../models/post.js";
editblog.use(verifyJWT);
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
editblog.post("/:id",upload.single("image"), async function (req, res, next) {
 
    console.log(req.body);
    const blogcnt = JSON.parse(req.body.blogcnt);
  
    const date = new Date();
    const updatedAt = date.toLocaleDateString();

    
    if(req.file)
    {

   const data={
    description:req.body.description,
    maintitle:req.body.maintitle,
    content:blogcnt,
    
    image:req.file.filename,
  
    updatedat:date,
    

   }
   await posts.findOneAndUpdate({_id:req.params.id},data);
    }
    else{
      const data={
        description:req.body.description,
        maintitle:req.body.maintitle,
        content:blogcnt,
        
      
      
        updatedAt:date,
        
    
       }
       await posts.findOneAndUpdate({_id:req.params.id},data);
    }
  
 
  

    
    res.status(200).send("done");
  
});
export default editblog;
