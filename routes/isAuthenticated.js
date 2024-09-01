import express from "express";
import comments from "../models/comment.js";
const isAuthenticated = express.Router();
import verifyJWT from "../middlewares/verifyJWT.js";
isAuthenticated.use(verifyJWT);
isAuthenticated.get("", async (req, res) => {

  try{
  if (req.user) 
    {
      return res.status(200).send(req.user);
    }
  }
  catch(err)
  {
    return res.status(400).send("unAuthorized")
  }
   
});
export default isAuthenticated;
