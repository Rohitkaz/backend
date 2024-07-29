import express from "express";
import comments from "../models/comment.js";
const isAuthenticated = express.Router();
import verifyJWT from "../middlewares/verifyJWT.js";
isAuthenticated.use(verifyJWT);
isAuthenticated.get("", async (req, res) => {
  console.log("hello");
  if (req.user) res.status(200).send(req.user);
});
export default isAuthenticated;
