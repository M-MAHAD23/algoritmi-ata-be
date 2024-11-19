const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const initializeCronJobs = require("./service/cronJobs");
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
app.use("/profile", require("./routes/ProfileRoute"));

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

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Initialize cron jobs after the server starts
      console.log("Cron jobs initialized.");
      initializeCronJobs();
    });
  })
  .catch((err) => {
    console.error("Error occurred during DB connection or server setup:", err);
  });
