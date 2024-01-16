const jwt = require('jsonwebtoken');
const db = require('../../config/db/index.js');
const User = db.user;

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Extract token from header

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
            if (err) {
                return "token expired";
            } else {
                return res;
            }
        });

        if (decoded == "token expired") {
            return res.send({
                message: "token expired",
                data: "token expired"
            })
        }

        const user = await User.findByPk(decoded.userId); // Retrieve user from database

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid user' });
        }

        req.user = user; // Attach user object to request for further use
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

const authorizeAdmin = async (req, res, next) => {
    try {
        if (req.user.ROLE === 'User') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = {
    verifyToken,
    authorizeAdmin,
};
