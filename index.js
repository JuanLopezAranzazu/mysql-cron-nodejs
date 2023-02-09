const express = require("express");
const app = express();
const cors = require("cors");
const { config } = require("./config/config");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
const userRouter = require("./routes/user.router");
app.use("/api/v1/users", userRouter);
const eventRouter = require("./routes/event.router");
app.use("/api/v1/events", eventRouter);
const notificationRouter = require("./routes/notification.router");
app.use("/api/v1/notifications", notificationRouter);

// node cron
const cron = require("node-cron");
const pool = require("./database");

cron.schedule("* * * * *", async () => {
  try {
    console.log("running a task every minute");
    const [events] = await pool.query(
      "SELECT * FROM event WHERE event_date = CURDATE()"
    );
    console.log("EVENTS CURDATE", events);
  } catch (error) {
    console.error(error);
  }
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.listen(config.port, () => {
  console.log("SERVER RUNNING IN PORT", config.port);
});
