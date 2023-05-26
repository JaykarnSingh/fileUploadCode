const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "userLogin" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "userLogin" }],
    file: {
      filename: { type: String, required: true },
      filePath: { type: String, required: true },
      fileURL: { type: String },
    },
  },
  { timestamps: true }
);

messageSchema.methods.generateFileURL = function () {
  const fileURL = `http://localhost:5000/uploads/${this.file.filename}`;
  this.file.fileURL = fileURL;
};

messageSchema.pre('save', function (next) {
  if (this.file) {
    this.generateFileURL();
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
