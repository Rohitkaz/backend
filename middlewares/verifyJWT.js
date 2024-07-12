import express from "express";
const Auth = express.Router();
import jwt from "jsonwebtoken";

import cookieParser from "cookie-parser";

import connect from "./db.js";
import users from "../models/users.js";
import bcrypt from "bcrypt";

import dotenv from "dotenv";

const verifyJWT = (req, res, next) => {
  console.log(req.cookies.refreshToken);
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
};
export default verifyJWT;
