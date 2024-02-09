const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    default: "Not Specified",
  },
  rollNo: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attemptedQuestions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Attempt",
    default: [],
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
