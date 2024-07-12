import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("hi");
});
router.get("/image", (req, res) => {
  res.send("hello");
});

export default router;
