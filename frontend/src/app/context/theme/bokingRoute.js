const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookingsForOwner,
  updateBookingStatus,
  getBookingsForRenter,
} = require("../controllers/bookingController");
const auth = require("../middlewares/authMiddleware");

// POST /api/bookings – Renters book property
router.post("/", auth, createBooking);

// GET /api/bookings/owner – Owner sees all booking requests
router.get("/owner", auth, getBookingsForOwner);

// PATCH /api/bookings/:id – Owner updates booking status
router.patch("/:id", auth, updateBookingStatus);

router.get("/me", auth, getBookingsForRenter);

module.exports = router;
