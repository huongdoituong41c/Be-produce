var express = require('express');
var router = express.Router();
const { verifyToken, authorizeAdmin } = require('../app/middlewares/index.js');

const roomTypeController = require('../app/controllers/RoomTypeController.js');

router.delete('/delete/:typeRoomId', verifyToken, authorizeAdmin, roomTypeController.deleteTypeRoom);

router.put('/update/:typeRoomId', verifyToken, authorizeAdmin, roomTypeController.updateTypeRoom);

router.post('/create', verifyToken, authorizeAdmin, roomTypeController.addTypeRoom);

router.get('/:typeRoomId', roomTypeController.getTypeRoom);

// Always at the bottom
router.get('/', roomTypeController.index);

module.exports = router
