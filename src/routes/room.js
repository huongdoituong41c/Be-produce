var express = require('express');
var router = express.Router();
const { verifyToken, authorizeAdmin } = require('../app/middlewares/index.js');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/img');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const roomController = require('../app/controllers/RoomController.js');

router.get('/management', verifyToken, authorizeAdmin, roomController.roomManagement);

router.delete('/delete/:roomId', verifyToken, authorizeAdmin, roomController.deleteRoom);

router.put('/update/:roomId', upload.any(), verifyToken, authorizeAdmin, roomController.updateRoom);

router.post('/create', upload.single('file'), verifyToken, authorizeAdmin, roomController.addRoom);

router.get('/:hotelId', roomController.getRoomByHotelId);

// Always at the bottom
router.get('/', roomController.index);

module.exports = router
