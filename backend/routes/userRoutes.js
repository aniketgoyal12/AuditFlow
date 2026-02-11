const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/", async(req,res) => {
    const user = await user.create(req.body)
    req.json(user)
})

router.put("/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  res.json(user)
})

router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.json({ message: "Deleted" })
})

router.get("/", async (req, res) => {
  const users = await User.find()
  res.json(users)
})

module.exports = router