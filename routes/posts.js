import express from "express";
const router = express.Router();
import PostModel from "../models/posts.js";
import UserModel from '../models/users.js'

import multer from "multer";
const MAX_FILE_SIXE = 20000000

const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() + 1e9);
    const fileExt = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`);
  },
});
const internalUpload = multer({
  storage: internalStorage,
  limits: { fileSize: MAX_FILE_SIXE }
});
router.post(
  "/posts/uploadImg",
  internalUpload.single("img"),
  async (req, res) => {
    const url = req.protocol + "://" + req.get("host");
    try {
      const imgUrl = req.file.filename;
      res.status(200).json({
        img: `${url}/uploads/${imgUrl}`,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).send({
        message: "File upload error",
        statusCode: 500,
      });
    }
  }
);
router.get("/posts", async (req, res) => {
  const { page = 1, pageSize = 14 } = req.query;

  try {
    const posts = await PostModel.find()
      .populate('author', 'username email role')
      .limit(pageSize)
      .skip((page - 1) * pageSize)

    const totalPosts = await PostModel.count();

    res.status(200).send({
      message: "Operazione eseguita correttamente",
      statusCode: 200,
      count: totalPosts,
      currentPage: +page,
      totalPage: Math.ceil(totalPosts / pageSize),
      posts,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Errore interno del server",
    });
  }
});
router.get("/posts/bytitle/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const postByTitle = await PostModel.find({
      title: {
        $regex: ".*" + title + ".*",
        $options: "i",
      },
    });
    if (!postByTitle || postByTitle.length === 0) {
      return res.status(404).send({
        message: "Non esiste un post con questo titolo",
        statusCode: 404,
      });
    }
    res.status(200).send({
      message: "Post trovato",
      statusCode: 200,
      postByTitle,
    });
  } catch (error) {
    res.status(500).send({
      message: "Errore interno del server",
    });
  }
});
router.post("/posts", async (req, res) => {

  const user = await UserModel.findOne({ _id: req.body.author })
  const newPost = new PostModel({
    title: req.body.title,
    content: req.body.content,
    author: user._id,
    img: req.body.img,
    rate: req.body.rate,
  })
  try {
    const post = await newPost.save()
    await UserModel.updateOne({ _id: user._id }, { $push: { posts: post } })
    res.status(200)
      .send({
        message: 'Post salvato correttamente',
        statusCode: 200,
        post
      })
  } catch (error) {
    res.status(500)
      .send({
        message: 'Errore interno del server',
        statusCode: 500
      })
  }
})
router.patch("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const postExist = await PostModel.findById(id);
  if (!postExist) {
    return res.status(404).send({
      message: "Post inesistente",
      statusCode: 404,
    });
  }
  try {
    const postId = id;
    const dataUpdated = req.body;
    const options = { new: true };
    const result = await PostModel.findByIdAndUpdate(
      postId,
      dataUpdated,
      options
    );
    res.status(200).send({
      message: "Post modificato con successo",
      statusCode: 200,
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Errore interno del server",
    });
  }
});
router.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const postExist = await PostModel.findByIdAndDelete(id);
    if (!postExist) {
      return res.status(404).send({
        message: "Post non trovato",
        statusCode: 404,
      });
    }
    res.status(200).send({
      message: `Post con id ${id} rimosso dal db`,
      statusCode: 200,
    });
  } catch (error) {
    res.status(404).send({
      message: "Errore interno del server",
    });
  }
});

export default router;