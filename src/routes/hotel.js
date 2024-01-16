var express = require('express')
var router = express.Router()
const multer = require('multer');
const path = require('path');
const hotelController = require('../app/controllers/HotelController');
const { verifyToken, authorizeAdmin } = require('../app/middlewares');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/img');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/management', verifyToken, authorizeAdmin, hotelController.hotelManagement);

router.delete('/delete/:hotelId', verifyToken, authorizeAdmin, hotelController.deleteHotel);

router.put('/update/:hotelId', upload.any(), verifyToken, authorizeAdmin, hotelController.updateHotel);

router.post('/create', upload.array('file'), verifyToken, authorizeAdmin, hotelController.createHotel);

router.get('/search', hotelController.searchHotels);

router.get('/:hotelId', hotelController.getHotelById);

// Always at the bottom
router.get('/', hotelController.index);

module.exports = router
