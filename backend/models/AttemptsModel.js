const mongoose = require("mongoose")

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question", 
    required: true,
  },
  selectedOption: {
    type: Number,
    min: 0,
    max: 3,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const Attempt = mongoose.model("Attempt", attemptSchema)

module.exports = Attempt
