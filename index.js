const express = require("express");
const { startSession } = require("./subscriber/startSession");
const { endSession } = require("./subscriber/endSession");

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200);
  res.send("Welcome to root URL of Server");
});

app.get("/startsession", startSession);
app.post("/endsession", endSession);

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else {
    console.log("Error occurred, server can't start", error);
  }
});
