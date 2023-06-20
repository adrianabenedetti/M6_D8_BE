import express from "express";
import UserModel from "../models/users.js";
import bcrypt from "bcrypt";
import logger from "../middleware/logger.js";
import validateUser from "../middleware/validateUser.js";
import cacheMiddleware from "../middleware/cacheMiddleware.js";
//  import {verifyToken} from '../middleware/verifyToken.js'

const router = express.Router();

router.get("/users", async (req, res) => {
  const { page = 1, pageSize = 3 } = req.query;
  try {
    const users = await UserModel.find()
      .populate("posts")
      .limit(pageSize)
      .skip((page - 1) * pageSize);

    const totalUsers = await UserModel.count();

    res.status(200).send({
      count: totalUsers,
      currentPage: +page,
      totalPage: Math.ceil(totalUsers / pageSize),
      users,
    });
  } catch (error) {
    res.status(500).send({
      message: "Errore interno del server",
    });
  }
});
router.post("/users", validateUser, async (req, res) => {
  const genSalt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, genSalt);

  const user = new UserModel({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
    age: req.body.age,
  });
  console.log(req.body.email, req.body.username);
  try {
    const userExists = await UserModel.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (userExists) {
      return res
        .status(409)
        .send({ message: "Username or email already in use" });
    }

    const newUser = await user.save();
    res.status(201).send({
      message: "Utente registrato",
      payload: newUser,
    });
  } catch (error) {
    res.status(500).send({
      message: "Errore interno del server",
    });
  }
});
router.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const userExist = await UserModel.findById(id);
  if (!userExist) {
    return res.status(404).send({
      message: "User not found",
    });
  }
  try {
    const userID = id;
    const dataUpdated = req.body;
    const options = { new: true };
    const result = await UserModel.findByIdAndUpdate(
      userID,
      dataUpdated,
      options
    );
    res.status(200).send({
      message: "Utente modificato",
      payload: result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Errore interno del server",
    });
  }
});

export default router;
