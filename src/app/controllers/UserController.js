const db = require('../../config/db/index.js')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = db.user;
const Booking = db.booking;
const dotenv = require('dotenv');
dotenv.config();

class UserController {
    //[GET] /user
    async index(req, res, next) {
        try {
            const { page, limit } = req.query;
            let users;

            if (page && limit) {
                const offset = (page - 1) * limit;
                users = await User.findAll({
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                    order: [
                        ['createdAt', 'DESC'],
                    ]
                });
            } else {
                users = await User.findAll({
                    order: [
                        ['createdAt', 'DESC'],
                    ]
                });
            }

            const totalUsers = await User.count();

            let tempUsers = [];
            users.forEach(user => {
                const data = {
                    user_id: user.ID,
                    first_name: user.FIRSTNAME,
                    last_name: user.LASTNAME,
                    email: user.EMAIL,
                    role: user.ROLE,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
                tempUsers.push(data)
            });

            res.status(201).json({
                message: "Get users successful",
                data: tempUsers,
                totalCount: totalUsers
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /user/userInfo
    async getUser(req, res, next) {
        try {
            const userId = req.user.ID;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            const tempUser = Object.assign({}, user);
            delete tempUser.dataValues.PASSWORD;

            res.status(201).json({
                message: "get user successful",
                data: {
                    user_id: tempUser.dataValues.ID,
                    first_name: tempUser.dataValues.FIRSTNAME,
                    last_name: tempUser.dataValues.LASTNAME,
                    email: tempUser.dataValues.EMAIL,
                    role: tempUser.dataValues.ROLE,
                    createdAt: tempUser.dataValues.createdAt,
                    updatedAt: tempUser.dataValues.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /user/:userId
    async getUserById(req, res, next) {
        try {
            const { userId } = req.params;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            const tempUser = Object.assign({}, user);
            delete tempUser.dataValues.PASSWORD;

            res.status(201).json({
                message: "get user successful",
                data: {
                    user_id: tempUser.dataValues.ID,
                    first_name: tempUser.dataValues.FIRSTNAME,
                    last_name: tempUser.dataValues.LASTNAME,
                    email: tempUser.dataValues.EMAIL,
                    role: tempUser.dataValues.ROLE,
                    createdAt: tempUser.dataValues.createdAt,
                    updatedAt: tempUser.dataValues.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /user/register
    async register(req, res, next) {
        try {
            const salt = await bcrypt.genSalt(10);

            const isEmailExist = await User.findOne({ where: { EMAIL: req.body.email } })
            if (isEmailExist) {
                return res.status(401).json({ message: "Email already exists" });
            }

            var usr = {
                FIRSTNAME: req.body.first_name,
                LASTNAME: req.body.last_name,
                EMAIL: req.body.email,
                PASSWORD: await bcrypt.hash(req.body.password, salt),
                ROLE: req.body.role
            };
            let created_user = await User.create(usr);
            const tempUser = Object.assign({}, created_user);
            delete tempUser.dataValues.PASSWORD;

            res.status(201).json({
                message: "Register successful",
                data: {
                    user_id: tempUser.dataValues.ID,
                    first_name: tempUser.dataValues.FIRSTNAME,
                    last_name: tempUser.dataValues.LASTNAME,
                    email: tempUser.dataValues.EMAIL,
                    role: tempUser.dataValues.ROLE,
                    createdAt: tempUser.dataValues.createdAt,
                    updatedAt: tempUser.dataValues.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /user/login
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { EMAIL: email } });
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const passwordMatch = await bcrypt.compare(password, user.PASSWORD);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign({ userId: user.ID }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            res.json({
                message: "Login successful",
                token: token,
                userId: user.ID,
                role: user.ROLE
            });
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /user/update/:userId
    async updateUser(req, res, next) {
        try {
            const salt = await bcrypt.genSalt(10);
            const { first_name, last_name, email, role } = req.body;
            const { userId } = req.params;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            if (user.EMAIL === "duongthecong2000@gmail.com") {
                return res.status(401).json({ message: "This user can not update" });
            }

            // const isEmailExist = await User.findOne({ where: { EMAIL: req.body.email } })
            // if (isEmailExist && user.EMAIL !== email) {
            //     return res.status(401).json({ message: "Email already exists" });
            // }

            // let newPassWord;

            // const passwordMatch = await bcrypt.compare(password, user.PASSWORD);
            // passwordMatch ? newPassWord = user.PASSWORD : newPassWord = await bcrypt.hash(password, salt);

            var usr = {
                FIRSTNAME: first_name,
                LASTNAME: last_name,
                EMAIL: email,
                // PASSWORD: newPassWord,
                ROLE: role
            };

            await user.update(usr);
            const userUpdate = await user.save();
            const tempUser = Object.assign({}, userUpdate);
            delete tempUser.dataValues.PASSWORD;

            res.json({
                message: "Update user successful",
                data: {
                    user_id: tempUser.dataValues.ID,
                    first_name: tempUser.dataValues.FIRSTNAME,
                    last_name: tempUser.dataValues.LASTNAME,
                    email: tempUser.dataValues.EMAIL,
                    role: tempUser.dataValues.ROLE,
                    createdAt: tempUser.dataValues.createdAt,
                    updatedAt: tempUser.dataValues.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /user/delete/:userId
    async deleteUser(req, res, next) {
        try {
            const { userId } = req.params;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            if (user.EMAIL === "duongthecong2000@gmail.com") {
                return res.status(401).json({ message: "This user can not update" });
            }

            const checkUserbooked = await Booking.findOne({ where: { USER_ID: user.ID } });
            if (checkUserbooked) {
                await checkUserbooked.destroy();
            }
            await user.destroy();
            res.json({
                message: "Delete user successful",
                userId: userId
            });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController
