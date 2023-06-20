import express from "express";
import bcrypt from "bcrypt";
import UserModel from "../models/users.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).send({ message: "User not found", statusCode: 404 });
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res
      .status(400)
      .send({ message: "invalid user or password", statusCode: 400 });
  }
  const token = jwt.sign(
    {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      age: user.age,
      id: user._id,
    },
    process.env.SECRET_JWT_KEY,
    {
      expiresIn: "24h",
    }
  );
  res.header("auth", token).status(200).send({
    message: "Login succeded",
    statusCode: 200,
    token,
  });
});

export default router;
