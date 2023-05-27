import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import listEndpoints from "express-list-endpoints";

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/project-auth";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const PATHS = {
  root: "/",
  register: "/register",
  login: "/login",
  secrets: "/secrets",
  sessions: "/sessions"
}

app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex")
  }
});

const User = mongoose.model("User", UserSchema);

app.post(PATHS.register, async (req, res) => {
  const { name, password } = req.body;

  try {
    const salt = bcrypt.genSaltSync();
    const newUser = await new User({
      name: name,
      password: bcrypt.hashSync(password, salt)})
    .save();
    res.status(201).json({
      success: true,
      response: {
        name: newUser.name,
        id: newUser._id,
        accessToken: newUser.accessToken
      }
    })
  } catch (e) {
    res.status(400).json({
      success: false,
      response: e,
      message: 'Could not create user',
      errors: e.errors
    });
  }
});

app.post(PATHS.login, async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name: name });
    if (user && bcrypt.compareSync(password, user.password)) {
      res.set("Access-Control-Allow-Origin", "https://emilia-michelle-project-auth.netlify.app");
      res.status(200).json({
        success: true,
        response: {
          name: user.name,
          id: user._id,
          accessToken: user.accessToken
        }
      });
    } else {
      res.status(400).json({
        success: false,
        response: "Credentials do not match"
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e
    });
  }
});

const authenticateUser = async (req, res, next) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      next();
    } else {
      res.status(401).json({
        success: false,
        response: "Please log in",
        loggedOut: true
      })
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e
    });
  }
}

// Authenticate the user and return the secret message
app.get(PATHS.secrets, async (req, res) => {
  const accessToken = req.header("Authorization");
  try {
    const user = await User.findOne({ accessToken: accessToken });
    if (user) {
      const secretMessage = "This is the secret page! Woop woop";
      res.status(200).json({ secret: secretMessage });
    } else {
      res.status(401).json({
        success: false,
        response: "Please log in",
        loggedOut: true,
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e,
    });
  }
});

app.post(PATHS.sessions, async (req, res) => {
  const user = await User.findOne({ name: req.body.name });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json({ userId: user._id, accessToken: user.accessToken });
  } else {
    res.json({ notFound: true });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// Test in postman

// Post: http://localhost:8080/register 
// {
//   "name": "enter new name",
//   "password": "enter password"
// }

// Post: http://localhost:8080/login
// {
//     "name": "name",
//     "password": "password"
// }


// Get   http://localhost:8080/secrets
// Headers: Authorization
// Enter accessToken in value

// Post: http://localhost:8080/sessions
// {
//     "name": "name",
//     "password": "password"
// }

// Authenticated endpoint
// Return a 401 or 403 with error message if someone tries to access it without an authentication

// API should validate the user input when creating a new user, and return error messages which could be shown by the frontend 

// localStorage.removeItem() for log out (to not lose everything when logging out)
