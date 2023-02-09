const express = require("express");
const router = express.Router();
// db
const pool = require("./../database");
// middlewares
const { verifyToken } = require("./../middlewares/auth.middleware");

const findEventsByUser = async (req, res, next) => {
  try {
    const [events] = await pool.query("SELECT * FROM event WHERE user_id = ?", [
      req.user.id,
    ]);
    res.json(events);
  } catch (error) {
    console.error(error);
  }
};

const findAllEvents = async (req, res, next) => {
  try {
    const [events] = await pool.query("SELECT * FROM event WHERE true");
    res.json(events);
  } catch (error) {
    console.error(error);
  }
};

const createEvent = async (req, res, next) => {
  const { name, event_date } = req.body;
  try {
    const [eventSaved] = await pool.query(
      "INSERT INTO event(name, event_date, user_id) VALUES(?,?,?)",
      [name, event_date, req.user.id]
    );
    res.status(201).json({
      id: eventSaved.insertId,
      name,
      event_date,
      user_id: req.user.id,
    });
  } catch (error) {
    console.error(error);
  }
};

const updateEvent = async (req, res, next) => {
  const { name, event_date } = req.body;
  const { id } = req.params;
  try {
    const [eventUpdated] = await pool.query(
      "UPDATE event SET name = ?, event_date = ? WHERE user_id = ? AND id = ?",
      [name, event_date, req.user.id, id]
    );
    if (eventUpdated.affectedRows <= 0) {
      throw new Error("Error update event");
    }
    const [eventFound] = await pool.query("SELECT * FROM event WHERE id = ?", [
      id,
    ]);
    res.json(eventFound[0]);
  } catch (error) {
    console.error(error);
  }
};

router.get("/user", verifyToken, findEventsByUser);

router.get("/", findAllEvents);

router.post("/", verifyToken, createEvent);

router.put("/:id", verifyToken, updateEvent);

module.exports = router;
