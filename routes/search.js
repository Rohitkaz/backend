import express from "express";
import posts from "../models/post.js";
const search = express.Router();
search.get("", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Search for posts where the maintitle or description matches the query
    const searchResults = await posts.find({
      $or: [
        { maintitle: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).send(searchResults);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while searching" });
  }
});
export default search;
