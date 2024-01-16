var express = require('express');
var router = express.Router();
const { verifyToken, authorizeAdmin } = require('../app/middlewares/index.js');

const BookingController = require('../app/controllers/BookingController.js');

router.delete('/delete/:bookingId', verifyToken, authorizeAdmin, BookingController.deleteBooking);

router.patch('/updateStatus/:bookingId', verifyToken, BookingController.updateStatus);

router.post('/create', verifyToken, BookingController.addBooking);

router.get('/userBooking', verifyToken, BookingController.getBookingByUser);

router.get('/', verifyToken, authorizeAdmin, BookingController.index);

module.exports = router
