const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { MONGO_URI, NODE_ENV, PORT } = require("./config/env");
require('dotenv').config()

// TODO:middleware

app.use("/uploads", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//TODO: Routes

app.use("/auth", require("./routes/AuthRoute"));
app.use("/batch", require("./routes/BatchRoute"));
app.use("/user", require("./routes/UserRoute"));
app.use("/app", require("./routes/AppRoute"));
app.use("/chat", require("./routes/ChatRoute"));
app.use("/quiz", require("./routes/QuizRoute"));
app.use("/", require("./routes/CourseRoute"));
app.use("/profile", require("./routes/ProfileRoute"));
app.use("/enroll-course", require("./routes/EnrollRoute"));

//TODO: Deploy:

if (NODE_ENV == 'production') {
  app.use(express.static('client/build'))
  const path = require('path')
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

//TODO: Test the Server
app.get('/', (req, res) => {
  res.send('Hello World');
});

//TODO: Database and server created
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Database connected...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    console.log("Error occurred");
  });
