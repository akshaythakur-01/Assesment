require("dotenv").config()
const express = require("express")
const session = require("express-session")
const bcrypt = require("bcrypt")
const MongoDBStore = require("connect-mongodb-session")(session)
const User = require("./models/UserModel")
const Question = require("./models/QuestionModel")
const Attempt = require("./models/AttemptsModel")
const connectToDb = require("./connection/db")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const port = 2000 || process.env.PORT
const app = express()

connectToDb()
app.use(cors())
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

var store = new MongoDBStore({
  uri: process.env.DB_URL,
  collection: "mySessions",
})

store.on("error", function (error) {
  console.log(error)
})

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: store,
    resave: false,
    saveUninitialized: false,
  })
)

function isLoggedIn(req, res, next) {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7)

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decodedToken
      res.locals.isLoggedIn = true
      next()
    } catch (error) {
      res.locals.isLoggedIn = false
      return res.status(401).json({ status: "error", message: "Invalid token" })
    }
  } else {
    res.locals.isLoggedIn = false
    next()
  }
}

app.get("/", isLoggedIn, (req, res) => {
  if (res.locals.isLoggedIn) {
    res.status(200).json({ status: "ok", message: "Logged In", user: req.user })
  } else {
    res.status(403).json({ status: "error", message: "Not Logged In" })
  }
})

app.post("/signup", async (req, res) => {
  const { name, age, gender, rollNo, password, confirmPass } = req.body
  if (!name || !age || !gender || !rollNo || !password || !confirmPass) {
    return res
      .status(400)
      .json({ status: "error", message: "Please enter all fields" })
  }
  if (password !== confirmPass) {
    return res
      .status(400)
      .json({ status: "error", message: "Passwords do not match" })
  }
  if (rollNo) {
    const userInDatabase = await User.findOne({ rollNo: rollNo })
    if (userInDatabase) {
      return res
        .status(400)
        .json({ status: "error", message: "User already exists" })
    }
  }
  const hashedPassword = bcrypt.hashSync(password, 12)
  const newUser = {
    name,
    age,
    gender,
    password: hashedPassword,
    rollNo,
  }
  try {
    const userCreated = await User.create(newUser)
    return res
      .status(201)
      .json({ status: "ok", message: "User signed up!", user: userCreated })
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .json({ status: "error", message: "Something went wrong" })
  }
})

app.post("/signin", isLoggedIn, async (req, res) => {
  if (res.locals.isLoggedIn) {
    return res.status(200).json({ status: "ok", message: "Already Logged In" })
  }
  const { rollNo, password } = req.body
  if (!rollNo || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Please enter all fields" })
  }
  const userInDatabase = await User.findOne({ rollNo: rollNo })
  if (!userInDatabase) {
    return res
      .status(400)
      .json({ status: "error", message: "User does not exist" })
  }
  const isPasswordCorrect = bcrypt.compareSync(
    password,
    userInDatabase.password
  )
  if (!isPasswordCorrect) {
    return res
      .status(400)
      .json({ status: "error", message: "Incorrect Password" })
  }
  const token = jwt.sign(
    {
      name: userInDatabase.name,
      rollNo: userInDatabase.rollNo,
      userId: userInDatabase._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  return res.status(200).json({
    status: "ok",
    message: "Logged In",
    token: token,
    user: userInDatabase,
  })
})

app.get("/dashboard", isLoggedIn, async (req, res) => {
  if (!res.locals.isLoggedIn) {
    return res.status(403).json({ status: "error", message: "Not Logged In" })
  }
  const user = await User.findOne({ rollNo: req.user.rollNo })
  res.status(200).json({ status: "ok", user: user })
})

app.get("/questions", isLoggedIn, async (req, res) => {
  if (!res.locals.isLoggedIn) {
    return res.status(403).json({ status: "error", message: "Not Logged In" })
  }
  const questions = await Question.find()
  res.status(200).json({ status: "ok", questions: questions })
})

app.get("/quiz/start", isLoggedIn, async (req, res) => {
  if (!res.locals.isLoggedIn) {
    return res.status(403).json({ status: "error", message: "Not Logged In" })
  }
  const random5Questions = await Question.aggregate([{ $sample: { size: 5 } }])
  res.status(200).json({ status: "ok", questions: random5Questions })
})

app.post("/quiz/submit", isLoggedIn, async (req, res) => {
  if (!res.locals.isLoggedIn) {
    return res.status(403).json({ status: "error", message: "Not Logged In" })
  }
  try {
    const { answers } = req.body
    console.log(req.body)
    const questionIds = answers.map((answer) => answer.questionId)
    const questions = await Question.find({ _id: { $in: questionIds } })

    let score = 0
    const attemptData = []
    for (const answer of answers) {
      const question = questions.find((q) => q._id.equals(answer.questionId))
      if (!question) {
        return res.status(400).json({
          status: "error",
          message: `Question ${answer.questionId} not found`,
        })
      }
      const isCorrect = question.correctOption === answer.selectedOption
      if (isCorrect) {
        score++
      }
      attemptData.push({
        userId: req.user.id,
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timestamp: new Date(),
      })
    }

    // Store attempts in the database
    await Attempt.insertMany(attemptData)

    res.status(200).json({
      status: "success",
      message: "Quiz submitted successfully",
      score,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    res.status(500).json({ status: "error", message: "Internal server error" })
  }
})

app.get("/attempts", async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.userId }).populate(
      "questionId"
    )
    res.status(200).json(attempts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.post("/attempts", async (req, res) => {
  try {
    const { questionId, selectedOption, isCorrect } = req.body
    if (!questionId || !selectedOption || !isCorrect) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const newAttempt = new Attempt({
      userId: req.userId,
      questionId,
      selectedOption,
      isCorrect,
    })
    await newAttempt.save()

    res.status(201).json({ message: "Attempt recorded successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.get("/signout", (req, res) => {
  req.session.destroy()
  res.status(200).json({ status: "ok", message: "Logged Out" })
})

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`)
})
