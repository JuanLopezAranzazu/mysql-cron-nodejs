const express = require("express");
const router = express.Router();
// db
const pool = require("./../database");
// middlewares
const { verifyToken } = require("./../middlewares/auth.middleware");

const findAllNotifications = async (req, res, next) => {
  try {
    const [notifications] = await pool.query(
      "SELECT * FROM notification WHERE true"
    );
    res.json(notifications);
  } catch (error) {
    console.error(error);
  }
};

const findNotificationsByUser = async (req, res, next) => {
  try {
    const [notifications] = await pool.query(
      "SELECT * FROM notification WHERE id IN (SELECT notification_id FROM users_notifications WHERE user_id = ?)",
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error(error);
  }
};

router.get("/", findAllNotifications);

router.get("/user", verifyToken, findNotificationsByUser);

module.exports = router;
