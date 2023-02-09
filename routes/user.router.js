const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
// db
const pool = require("./../database");
// middlewares
const { verifyToken } = require("./../middlewares/auth.middleware");

const findAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query("SELECT * FROM user WHERE true");
    res.json(users);
  } catch (error) {
    console.error(error);
  }
};

const registerUser = async (req, res, next) => {
  const { username, password, email } = req.body;
  try {
    const [userFound] = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );
    if (userFound.length > 0) throw new Error("User already exists");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const [userSaved] = await pool.query(
      "INSERT INTO user(username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    const token = await jwt.sign({ id: userSaved.insertId }, "JWT_SECRET", {
      expiresIn: "1hr",
    });

    res.json({ id: userSaved.insertId, token });
  } catch (error) {
    console.error(error);
  }
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const [userFound] = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );
    if (userFound.length <= 0) throw new Error("User not found");

    const passwordCorrect = await bcrypt.compare(
      password,
      userFound[0].password
    );

    if (!passwordCorrect) throw new Error("Incorrect or missing password");

    const token = await jwt.sign({ id: userFound[0].id }, "JWT_SECRET", {
      expiresIn: "1hr",
    });

    res.json({ id: userFound[0].id, token });
  } catch (error) {
    console.error(error);
  }
};

// join event
const joinEvent = async (req, res, next) => {
  const { event_id } = req.body;
  try {
    const [eventFound] = await pool.query("SELECT * FROM event WHERE id = ?", [
      event_id,
    ]);
    if (eventFound.length <= 0) throw new Error("Event not found");

    await pool.query(
      "INSERT INTO users_events(user_id, event_id) VALUES(?,?)",
      [req.user.id, event_id]
    );
    res.status(201).json({ user_id: req.user.id, event_id });
  } catch (error) {
    console.error(error);
  }
};

const unjoinEvent = async (req, res, next) => {
  const { event_id } = req.body;
  try {
    await pool.query(
      "DELETE FROM users_events WHERE user_id = ? AND event_id = ?",
      [req.user.id, event_id]
    );
    res.status(204).json({ user_id: req.user.id, event_id });
  } catch (error) {
    console.error(error);
  }
};

router.get("/", findAllUsers);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/join-event", verifyToken, joinEvent);

router.delete("/unjoin-event", verifyToken, unjoinEvent);

module.exports = router;
