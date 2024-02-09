const mongoose = require("mongoose")

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { dbName: "QuizApp" })
    console.log("Database Connected!")
  } catch (err) {
    console.log(err)
  }
}

module.exports = connectToDb
