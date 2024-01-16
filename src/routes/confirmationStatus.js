var express = require('express');
var router = express.Router();
const { verifyToken, authorizeAdmin } = require('../app/middlewares/index.js');

const confirmationStatusController = require('../app/controllers/ConfirmationStatusController');

router.delete('/delete/:statusId', verifyToken, authorizeAdmin, confirmationStatusController.deleteStatus);

router.put('/update/:statusId', verifyToken, authorizeAdmin, confirmationStatusController.updateStatus);

router.post('/create', verifyToken, authorizeAdmin, confirmationStatusController.addStatus);

router.get('/', confirmationStatusController.index);

module.exports = router
