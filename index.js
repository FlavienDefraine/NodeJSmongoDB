express = require("express");
mongoose = require("mongoose");
bcrypt = require("bcrypt");
jwt = require("jsonwebtoken");
app = express();

app.use(express.json());

/* DATABASE */
//  mongodb+srv://admin:0nUzX7Q8eCRgUQGK@cluster0.luzfv7s.mongodb.net/?retryWrites=true&w=majority

mongoose
  .connect(
    "mongodb+srv://admin:0nUzX7Q8eCRgUQGK@cluster0.luzfv7s.mongodb.net/?retryWrites=true&w=majority",
  )
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
  });

/*   mongoose schema */

const userSchema = mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  imageUrl: { type: String, required: true },
  age: { type: Number, required: true },
});

// module.exports = mongoose.model('User', userSchema);

/** cors middleware */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  next();
});

/* GET endpoint  */
app.get("/", (req, res) => {
  res.status(200).json({ msg: "welcome to my node js express rest API!" });
});

app.get("/api/users", (req, res, next) => {
  const users_list = [
    {
      _id: "oeihfzeoi",
      userName: "user one",
      email: "one@me.net",
      password: "password",
      imageUrl: "",
      age: 32,
    },
    {
      _id: "fghfh54",
      userName: "user two",
      email: "two@me.net",
      password: "password_two",
      imageUrl: "",
      age: 25,
    },
  ];
  res.status(200).json(users_list);
});

app.post("/api/users", (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: req.body,
  });
});

/* new user blueprint */
const User = mongoose.model("User", userSchema);

app.get("/api/stuff", (req, res, next) => {
  User.find()
    .then((things) => {
      res.status(200).json(things);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

app.post("/api/stuff", (req, res, next) => {
  /*  password hash  */
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hash,
      imageUrl: req.body.imageUrl,
      age: req.body.age,
    });
    newUser
      .save()
      .then(() => {
        res.status(201).json({
          message: "Post saved successfully!",
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  });
});

/*  logIn endpoint */
app.post("/api/login", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: new Error("User not found!"),
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              error: new Error("Incorrect password!"),
            });
          }
          const token = jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
            expiresIn: "24h",
          });
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => {
          res.status(500).json({
            error: error,
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

/*  secret route */
app.post("/api/secret", (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid user ID";
    } else {
      res.status(200).json({
        msg: "ok ok ...",
      });
    }
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
});

app.listen(3000, () => {
  console.log("server started on port 3000");
});
