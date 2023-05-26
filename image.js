


const express = require('express');
const router = express.Router();
const messageController = require('../controllers/uploadController');
const {
    allMessages,
    sendMessage,
  } = require("../controllers/messageControllers");

// Upload image route
router.post('/upload', messageController.route,sendMessage);
// router.get('/getupload', messageController.route);
module.exports = router;
