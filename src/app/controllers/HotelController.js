const db = require('../../config/db/index.js')
const Hotel = db.hotel;
const Room = db.room;
const Booking = db.booking;
const fs = require('fs');
const path = require('path')
const { Op } = require('sequelize');

class HotelController {

    //[GET] /hotel
    async index(req, res, next) {
        try {
            const { page, limit } = req.query;
            let hotels;

            if (page && limit) {
                const offset = (page - 1) * limit;
                hotels = await Hotel.findAll({
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                    order: [
                        ['createdAt', 'DESC'],
                    ]
                });
            } else {
                hotels = await Hotel.findAll({
                    order: [
                        ['createdAt', 'DESC'],
                    ]
                });
            }

            const totalHotels = await Hotel.count();
            const tempHotels = [];
            hotels.forEach(hotel => {
                let urlImages = [];
                for (let i = 0; i < hotel.IMAGE.length; i++) {
                    urlImages.push(typeof hotel.IMAGE[i] === 'object' ? `${req.protocol}://${req.headers.host}/img/${hotel.IMAGE[i].filename}` : hotel.IMAGE[i]);
                }

                const data = {
                    hotel_id: hotel.ID,
                    name: hotel.NAME,
                    address: hotel.ADDRESS,
                    description: hotel.DESCRIPTION,
                    image: urlImages,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt
                };
                tempHotels.push(data);
            });

            res.status(201).json({
                message: "Get hotels successful",
                data: tempHotels,
                totalCount: totalHotels
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /hotel/management?page=&limit=
    async hotelManagement(req, res, next) {
        try {
            const { page, limit } = req.query;
            let hotels = [];

            if (page && limit) {
                const offset = (page - 1) * limit;
                switch (req.user.ROLE) {
                    case "Super Admin":
                        hotels = await Hotel.findAll({
                            offset: parseInt(offset),
                            limit: parseInt(limit),
                            order: [
                                ['createdAt', 'DESC'],
                            ]
                        });
                        break;
                    case "Admin":
                        hotels = await Hotel.findAll({
                            offset: parseInt(offset),
                            limit: parseInt(limit),
                            where: {
                                USER_ID: req.user.ID
                            },
                            order: [
                                ['createdAt', 'DESC'],
                            ]
                        });
                        break;
                    default:
                        hotels = [];
                        break;
                }
            } else {
                if (req.user.ROLE !== "Super Admin") {
                    hotels = await Hotel.findAll({
                        where: {
                            USER_ID: req.user.ID
                        },
                        order: [
                            ['createdAt', 'DESC'],
                        ]
                    });
                } else {
                    hotels = await Hotel.findAll({
                        order: [
                            ['createdAt', 'DESC'],
                        ]
                    });
                }
            }


            const totalHotels = await Hotel.count();
            const tempHotels = [];
            hotels.forEach(hotel => {
                let urlImages = [];
                for (let i = 0; i < hotel.IMAGE.length; i++) {
                    urlImages.push(typeof hotel.IMAGE[i] === 'object' ? `${req.protocol}://${req.headers.host}/img/${hotel.IMAGE[i].filename}` : hotel.IMAGE[i]);
                }

                const data = {
                    hotel_id: hotel.ID,
                    name: hotel.NAME,
                    address: hotel.ADDRESS,
                    description: hotel.DESCRIPTION,
                    image: urlImages,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt
                };
                tempHotels.push(data);
            });

            res.status(201).json({
                message: "Get hotels successful",
                data: tempHotels,
                totalCount: totalHotels
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /hotel/:hotelId
    async getHotelById(req, res, next) {
        try {
            const { hotelId } = req.params;

            const hotel = await Hotel.findByPk(hotelId);
            if (!hotel) {
                return res.status(401).json({ message: "Hotel not found" });
            }

            let urlImages = [];
            for (let i = 0; i < hotel.IMAGE.length; i++) {
                urlImages.push(typeof hotel.IMAGE[i] === 'object' ? `${req.protocol}://${req.headers.host}/img/${hotel.IMAGE[i].filename}` : hotel.IMAGE[i])
            }

            res.status(201).json({
                message: "Get hotel successful",
                data: {
                    hotel_id: hotel.ID,
                    name: hotel.NAME,
                    address: hotel.ADDRESS,
                    description: hotel.DESCRIPTION,
                    image: urlImages,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /hotel/create
    async createHotel(req, res, next) {
        try {
            const { name, address, description } = req.body;

            const images = req.files;
            let urlImages = [];
            for (let i = 0; i < images.length; i++) {
                let pathToCheck = path.join(__dirname, '../../public/img/' + images[i].filename);
                if (!fs.existsSync(pathToCheck)) {
                    return res.render('error404');
                }
                urlImages.push(`${req.protocol}://${req.headers.host}/img/${images[i].filename}`)
            }

            var hotel = {
                NAME: name,
                ADDRESS: address,
                DESCRIPTION: description,
                IMAGE: images,
                USER_ID: req.user.ID
            };
            let created_hotel = await Hotel.create(hotel);

            res.status(201).json({
                message: "Create hotel successful",
                data: {
                    hotel_id: created_hotel.ID,
                    name: created_hotel.NAME,
                    address: created_hotel.ADDRESS,
                    description: created_hotel.DESCRIPTION,
                    image: urlImages,
                    createdAt: created_hotel.createdAt,
                    updatedAt: created_hotel.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //PUT /hotel/update/:hotelId
    async updateHotel(req, res, next) {
        try {
            const { name, address, description } = req.body;
            const { hotelId } = req.params;

            let urlImages = [];
            if (req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    let pathToCheck = path.join(__dirname, '../../public/img/' + req.files[i].filename);
                    if (!fs.existsSync(pathToCheck)) {
                        return res.render('error404');
                    }
                    urlImages.push(`${req.protocol}://${req.headers.host}/img/${req.files[i].filename}`);
                }
            } else {
                urlImages = req.body.file;
            }

            const hotel = await Hotel.findByPk(hotelId);
            if (!hotel) {
                return res.status(401).json({ message: "Hotel not found" });
            }

            if (hotel.USER_ID !== req.user.ID && req.user.ROLE === "User") {
                return res.status(401).json({ message: "Not allow" });
            }

            var hotelUpdate = {
                NAME: name,
                ADDRESS: address,
                DESCRIPTION: description,
                IMAGE: urlImages,
                USER_ID: hotel.USER_ID
            };

            await hotel.update(hotelUpdate);
            const updated_hotel = await hotel.save();

            res.status(201).json({
                message: "Update hotel successful",
                data: {
                    hotel_id: updated_hotel.ID,
                    name: updated_hotel.NAME,
                    address: updated_hotel.ADDRESS,
                    description: updated_hotel.DESCRIPTION,
                    image: updated_hotel.IMAGE,
                    createdAt: updated_hotel.createdAt,
                    updatedAt: updated_hotel.updatedAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    //[DELETE] /hotel/delete/:hotelId
    async deleteHotel(req, res, next) {
        try {
            const { hotelId } = req.params;

            const hotel = await Hotel.findByPk(hotelId);
            if (!hotel) {
                return res.status(401).json({ message: "Please, check your information again" });
            }

            if (hotel.USER_ID !== req.user.ID && req.user.ROLE === "User") {
                return res.status(401).json({ message: "Not allow" });
            }

            const roomsInHotel = await Room.findAll({
                where: { HOTEL_ID: hotel.ID }
            });

            if (roomsInHotel.length < 1) {
                hotel.destroy();
                return res.status(201).json({
                    message: "Delete hotel successful",
                    hotelId: hotelId
                });
            }

            for (const perRoom of roomsInHotel) {
                const booking = await Booking.findOne({ where: { ROOM_ID: perRoom.ID } });
                if (!booking) {
                    await perRoom.destroy();
                } else {
                    await booking.destroy();
                    await perRoom.destroy();
                }
            }

            hotel.destroy();
            res.status(201).json({
                message: "Delete hotel successful",
                hotelId: hotelId
            });
        } catch (error) {
            next(error);
        }
    }

    //[GET] /hotel/search?address=''&checkInDate=''&checkOutDate=''&typeRoom=''
    async searchHotels(req, res, next) {
        try {
            const { address, checkInDate, checkOutDate, typeRoom } = req.query;

            const hotels = await Hotel.findAll({
                where: {
                    ADDRESS: {
                        [Op.like]: `%${address.toLowerCase()}%`
                    }
                },
                include: [
                    {
                        model: db.room,
                        as: 'rooms',
                        where: {
                            ROOM_TYPE_ID: typeRoom,
                        }
                    }
                ]
            })

            const tempHotels = [];
            hotels.forEach(hotel => {
                let urlImages = [];
                for (let i = 0; i < hotel.IMAGE.length; i++) {
                    urlImages.push(typeof hotel.IMAGE[i] === 'object' ? `${req.protocol}://${req.headers.host}/img/${hotel.IMAGE[i].filename}` : hotel.IMAGE[i]);
                }
                const data = {
                    hotel_id: hotel.ID,
                    name: hotel.NAME,
                    address: hotel.ADDRESS,
                    description: hotel.DESCRIPTION,
                    image: urlImages,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt,
                };
                tempHotels.push(data);
            });

            res.status(201).json({
                message: "Search hotel successful",
                data: tempHotels
            });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new HotelController
