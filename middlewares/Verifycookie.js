import express from "express";
//const Sendblog = express.Router();

import jwt from "jsonwebtoken";
import verifyJWT from "./verifyJWT.js";
import cookieParser from "cookie-parser";

import connect from "./db.js";
import users from "../models/users.js";
import bcrypt from "bcrypt";
import posts from "../models/post.js";
import dotenv from "dotenv";

/*Sendblog.get("", async (req, res) => {
  const post = await posts.find({});
  res.status(200).send(post);
});
*/
const verifycookie = (req, res, next) => {
  console.log("Hello");
  const accessToken = req.cookies.jwt;

  if (!accessToken && !req.cookies.refreshToken) {
    if (!req.cookies.userIdentifier) {
      const viewedblogs = [];

      req.viewedblogs = viewedblogs;
      return next();
    } else {
      console.log("Hola");
      const userIdentifier = req.cookies.userIdentifier;
      jwt.verify(
        userIdentifier,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
          if (err) {
            return res.status(400).json("invalid user");
          }
          console.log(decoded);
          req.viewedblogs = decoded;
        }
      );
      return next();
    }
  } else if (!accessToken) {
    jwt.verify(
      req.cookies.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(400).json("Unauthorized");
        }
        const user = decoded;
        const newAccessToken = jwt.sign(
          { name: user.name, id: user.id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "10s", // Changed to "10s" for testing
          }
        );
        const newRefreshToken = jwt.sign(
          { name: user.name, id: user.id },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );
        res.cookie("jwt", newAccessToken, {
          sameSite: "none",
          maxAge: 10000, // Changed to 10000 for testing
          secure: true,
          httpOnly: true,
        });
        res.cookie("refreshToken", newRefreshToken, {
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
          secure: true,
          httpOnly: true,
        });
        req.user = user;

        console.log("refreshToken");
        return next(); // Use 'return' here to exit the callback
      }
    );
  } else {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json("invalid user");
      }
      req.user = decoded;
      return next(); // Use 'return' here to exit the callback
    });
  }
};
/*Sendblog.get("/:id", async (req, res) => {
  console.log(req.user);
  console.log(req.viewedblogs);
  const blog = await posts.findOne({ _id: req.params.id });

  res.status(200).send(blog);
});*/
export default verifycookie;

//export default ;//
