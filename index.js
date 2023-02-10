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

cron.schedule("0 0 12 * * *", async () => {
  try {
    console.log("running a task every day 12:00pm");

    const [events] = await pool.query(
      "SELECT * FROM event WHERE event_date = CURDATE()"
    );

    console.log("EVENTS CURDATE", events);

    events.forEach(async (event) => {
      const [notificationSaved] = await pool.query(
        "INSERT INTO notification(message) VALUES(?)",
        [`Event of the day ${event.name}`]
      );
      const [users] = await pool.query(
        "SELECT * FROM user WHERE id IN (SELECT user_id FROM users_events WHERE event_id = ?)",
        [event.id]
      );
      users.forEach(async (user) => {
        await pool.query(
          "INSERT INTO users_notifications(user_id, notification_id) VALUES(?,?)",
          [user.id, notificationSaved.insertId]
        );
      });
    });
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
