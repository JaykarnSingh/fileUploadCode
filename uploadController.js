const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Image = require("../models/messageModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const express = require("express");
const route = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationDir = "uploads";
    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    cb(null, destinationDir);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + "_" + Date.now() + extension;
    cb(null, filename);
  },
});

// Multer upload instance
const upload = multer({ storage });

// Handle file upload

route.post("/upload", upload.single("file"), async (req, res) => {


  


  try {
    if (!req.file) {
      throw new Error("No file received");
    }

    const { filename, path: filePath } = req.file || {};
    const { sender, readBy, chat } = req.body;

    // console.log(sender)
    const allMessages = async (req, res) => {
      try {
        const messages = await Image.find({ chat: req.params.chatId })
          .populate("sender", "name pic email")
          .populate("chat");
        res.json(messages);
      } catch (error) {
        res.status(400).json({ error: "error" });
      }
    };
    

    const fileSize = req.file.size;

    const fileExtension = path.extname(filename);

    const fileName = path.basename(filename, fileExtension);

    const serverFilePath = req.file.path;

    // Create a new image document
    const image = new Image({
      file: {
        filename: filename || fileName,
        filePath: serverFilePath || "",
        fileURL: "",
      },
      sender: sender,
      chat: chat,
      readBy: readBy || [],
    });

    const savedImage = await image.save();
    const fileURL = `${req.protocol}://${req.get("host")}/uploads/${
      savedImage.file.filename
    }`;
    savedImage.file.fileURL = fileURL;
    await savedImage.save();

    res.status(200).json(savedImage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error uploading image" });
  }
});


  //....................................................................
  const allMessages = async (req, res) => {
    try {
      const messages = await Image.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: "error" });
    }
  };
  
  const sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.body;
  
    if (!chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
  
    var newMessage = {
      sender: req.user._id,
    //   content: content,
      chat: chatId,
    };
  
    try {
      var message = await Message.create(newMessage);
  
      message = await message.populate("sender", "name pic").execPopulate();
      message = await message.populate("chat").execPopulate();
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
  
      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
  
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "error" });
    }
  });
  //..................................................................

module.exports = {
  route,
  allMessages,
  sendMessage
};
