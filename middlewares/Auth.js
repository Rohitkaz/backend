import express from "express";
const Auth = express.Router();

import jwt from "jsonwebtoken";
import verifyJWT from "./verifyJWT.js";
import cookieParser from "cookie-parser";

import connect from "./db.js";
import users from "../models/users.js";
import bcrypt from "bcrypt";

import dotenv from "dotenv";
Auth.use(express.json());

Auth.use(cookieParser());
dotenv.config();

Auth.post("/register", async (req, res) => {
  const name1 = req.body.name;
  const password1 = req.body.password;
  console.log(req.body);
  const encpassword = await bcrypt.hash(password1, 10);
  // console.log(encpassword);
  const data = {
    name: name1,
    password: encpassword,
  };
  const user1 = await users.findOne({ name: name1 });
  if (user1) return res.status(409).json("user already exist");

  const user = new users(data);
  await user.save();
  return res.status(200).json("user regisetered");
});
Auth.post("/login", async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  console.log(req.body.name);
  const user = await users.findOne({ name: name });
  // console.log(user.id);
  if (!user) {
    return res.status(404).json("user not found");
  } else {
    const match = await bcrypt.compare(password, user.password);
    if (match === true) {
      const id = user.id;
      const accessToken = jwt.sign(
        { name: name, id: id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10 secs",
        }
      );
      const refreshToken = jwt.sign(
        { name: name, id: id },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1 day",
        }
      );

      // res.setHeader("");
      res.cookie("jwt", accessToken, {
        sameSite: "none",
        maxAge: 1000 * 10,
        secure: true,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
      });

      res.status(200).json({ name });
    } else res.status(401);
  }

  // verify the name

  // if user is valid
});
Auth.get("/logout", (req, res) => {
  // console.log("hi");
  res.cookie("jwt", "", {
    sameSite: "none",
    maxAge: 0,
    secure: true,
    httpOnly: true,
    domain: "localhost",
    path: "/",
  });
  res.cookie("refreshToken", "", {
    sameSite: "none",
    maxAge: 0,
    secure: true,
    httpOnly: true,
    domain: "localhost",
    path: "/",
  });
  res.status(204).send("hi");
});
// middlewarte
Auth.use((req, res, next) => {
  const accessToken = req.cookies.jwt;

  if (!accessToken && !req.cookies.refreshToken)
    return res.status(401).json("No token");

  if (!accessToken) {
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
});

export default Auth;
