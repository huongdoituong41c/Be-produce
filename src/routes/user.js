var express = require('express');
var router = express.Router();
const { verifyToken, authorizeAdmin } = require('../app/middlewares/index.js');

const userController = require('../app/controllers/UserController');

router.delete('/delete/:userId', verifyToken, authorizeAdmin, userController.deleteUser);

router.put('/update/:userId', verifyToken, authorizeAdmin, userController.updateUser);

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/detailUser/:userId', verifyToken, userController.getUserById);

router.get('/userInfo', verifyToken, userController.getUser);

// Always at the bottom
router.get('/', verifyToken, authorizeAdmin, userController.index);

module.exports = router
