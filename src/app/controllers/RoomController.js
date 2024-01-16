const db = require('../../config/db/index.js');
const Room = db.room;
const Booking = db.booking;
const fs = require('fs');
const path = require('path');

class RoomController {
    //[GET] /room
    async index(req, res, next) {
        try {
            const { page, limit } = req.query;
            let rooms;
            if (page && limit) {
                const offset = (page - 1) * limit;
                rooms = await Room.findAll({
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                    include: [
                        {
                            model: db.type_room,
                            as: 'typeRoom'
                        },
                        {
                            model: db.hotel,
                            as: 'hotel'
                        }
                    ],
                    order: [
                        ['createdAt', 'DESC'],
                    ],
                });
            } else {
                rooms = await Room.findAll(
                    {
                        include: [
                            {
                                model: db.type_room,
                                as: 'typeRoom'
                            },
                            {
                                model: db.hotel,
                                as: 'hotel'
                            }
                        ],
                        order: [
                            ['createdAt', 'DESC'],
                        ],
                    }
                );
            }

            const totalRooms = await Room.count();
            const tempRooms = [];
            rooms.forEach(room => {
                const data = {
                    room_id: room.ID,
                    hotel_id: room.hotel.ID,
                    room_type_id: room.typeRoom.ID,
                    hotel: room.hotel.NAME,
                    room_type: room.typeRoom.TYPE_NAME,
                    availability: room.AVAILABILITY,
                    price: room.typeRoom.PRICE_PER_NIGHT,
                    description: room.DESCRIPTION,
                    name: room.NAME,
                    image: typeof room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${room.IMAGE.filename}` : room.IMAGE,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                };
                tempRooms.push(data);
            });

            res.status(201).json({
                message: "Get rooms successful",
                data: tempRooms,
                totalCount: totalRooms
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /room/management?page=&limit=
    async roomManagement(req, res, next) {
        try {
            const { page, limit } = req.query;
            const offset = (page - 1) * limit;
            let rooms = [];

            switch (req.user.ROLE) {
                case "Super Admin":
                    rooms = await Room.findAll(
                        {
                            offset: parseInt(offset),
                            limit: parseInt(limit),
                            include: [
                                {
                                    model: db.type_room,
                                    as: 'typeRoom'
                                },
                                {
                                    model: db.hotel,
                                    as: 'hotel',
                                    order: [
                                        ['NAME', 'DESC'],
                                    ],
                                }
                            ],
                        }
                    );
                    break;
                case "Admin":
                    rooms = await Room.findAll(
                        {
                            offset: parseInt(offset),
                            limit: parseInt(limit),
                            include: [
                                {
                                    model: db.type_room,
                                    as: 'typeRoom'
                                },
                                {
                                    model: db.hotel,
                                    as: 'hotel',
                                    where: {
                                        USER_ID: req.user.ID
                                    },
                                    order: [
                                        ['NAME', 'DESC'],
                                    ],
                                }
                            ],
                        }
                    );
                    break;
                default:
                    rooms = [];
                    break;
            }

            const totalRooms = await Room.count();
            const tempRooms = [];
            rooms.forEach(room => {
                const data = {
                    room_id: room.ID,
                    hotel_id: room.hotel.ID,
                    room_type_id: room.typeRoom.ID,
                    hotel: room.hotel.NAME,
                    room_type: room.typeRoom.TYPE_NAME,
                    availability: room.AVAILABILITY,
                    price: room.typeRoom.PRICE_PER_NIGHT,
                    description: room.DESCRIPTION,
                    name: room.NAME,
                    image: typeof room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${room.IMAGE.filename}` : room.IMAGE,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                };
                tempRooms.push(data);
            });

            res.status(201).json({
                message: "Get rooms successful",
                data: tempRooms,
                totalCount: totalRooms
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /room/:id
    async getRoomById(req, res, next) {
        try {
            const { roomId } = req.params;

            const room = await Room.findByPk(roomId);
            if (!room) {
                return res.status(401).json({ message: "Room not found" });
            }

            res.status(201).json({
                message: "Get room successful",
                data: {
                    room_id: room.ID,
                    hotel_id: room.HOTEL_ID,
                    room_type_id: room.ROOM_TYPE_ID,
                    availability: room.AVAILABILITY,
                    description: room.description,
                    name: room.NAME,
                    image: typeof room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${room.IMAGE.filename}` : room.IMAGE,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /room/create
    async addRoom(req, res, next) {
        try {
            const { hotelId, roomTypeId, availability, description, name } = req.body;

            let pathToCheck = path.join(__dirname, '../../public/img/' + req.file.filename);
            if (!fs.existsSync(pathToCheck)) {
                return res.render('error404');
            };

            var roomCreate = {
                HOTEL_ID: hotelId,
                ROOM_TYPE_ID: roomTypeId,
                AVAILABILITY: availability,
                DESCRIPTION: description.split(","),
                NAME: name,
                IMAGE: req.file
            };

            let created_room = await Room.create(roomCreate);

            const room = await Room.findByPk(created_room.ID, {
                include: [
                    {
                        model: db.type_room,
                        as: 'typeRoom'
                    },
                    {
                        model: db.hotel,
                        as: 'hotel'
                    }
                ]
            });

            res.status(201).json({
                message: "Add room successful",
                data: {
                    room_id: room.ID,
                    hotel: room.hotel.NAME,
                    hotel_id: room.hotel.ID,
                    room_type_id: room.typeRoom.ID,
                    room_type: room.typeRoom.TYPE_NAME,
                    availability: room.AVAILABILITY,
                    price: room.typeRoom.PRICE_PER_NIGHT,
                    description: room.DESCRIPTION,
                    name: room.NAME,
                    image: `${req.protocol}://${req.headers.host}/img/${req.file.filename}`,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /room/update/:roomId
    async updateRoom(req, res, next) {
        try {
            const { hotelId, roomTypeId, availability, description, name } = req.body;
            const { roomId } = req.params;

            let image;
            if (req.files.length > 0) {
                let pathToCheck = path.join(__dirname, '../../public/img/' + req.files[0].filename);
                if (!fs.existsSync(pathToCheck)) {
                    return res.render('error404');
                }
                image = req.files[0];
            } else {
                image = req.body.file;
            }

            const room = await Room.findByPk(roomId, {
                include: [
                    {
                        model: db.type_room,
                        as: 'typeRoom'
                    },
                    {
                        model: db.hotel,
                        as: 'hotel'
                    }
                ]
            });

            if (!room) {
                return res.status(401).json({ message: "Room not found" });
            }

            if (room.hotel.USER_ID !== req.user.ID && req.user.ROLE === "User") {
                return res.status(401).json({ message: "Not allow" });
            }

            var roomUpdate = {
                HOTEL_ID: hotelId,
                ROOM_TYPE_ID: roomTypeId,
                AVAILABILITY: availability,
                DESCRIPTION: description.split(","),
                NAME: name,
                IMAGE: image
            };
            await room.update(roomUpdate);
            const updated_room = await Room.findByPk(room.ID, {
                include: [
                    {
                        model: db.type_room,
                        as: 'typeRoom'
                    },
                    {
                        model: db.hotel,
                        as: 'hotel'
                    }
                ]
            });

            res.status(201).json({
                message: "Update room successful",
                data: {
                    room_id: updated_room.ID,
                    hotel: updated_room.hotel.NAME,
                    hotel_id: updated_room.hotel.ID,
                    room_type_id: updated_room.typeRoom.ID,
                    room_type: updated_room.typeRoom.TYPE_NAME,
                    availability: updated_room.AVAILABILITY,
                    price: updated_room.typeRoom.PRICE_PER_NIGHT,
                    description: updated_room.DESCRIPTION,
                    name: updated_room.NAME,
                    image: typeof updated_room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${req.files[0].filename}` : updated_room.IMAGE,
                    createdAt: updated_room.createdAt,
                    updatedAt: updated_room.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /room/delete/:roomId
    async deleteRoom(req, res, next) {
        try {
            const { roomId } = req.params;

            const room = await Room.findByPk(roomId, {
                include: [
                    {
                        model: db.type_room,
                        as: 'typeRoom'
                    },
                    {
                        model: db.hotel,
                        as: 'hotel'
                    }
                ]
            });

            if (room.hotel.USER_ID !== req.user.ID && req.user.ROLE === "User") {
                return res.status(401).json({ message: "Not allow" });
            }

            if (!room) {
                return res.status(401).json({ message: "Room not found" });
            };

            const bookings = await Booking.findAll({ where: { ROOM_ID: room.ID } });

            if (bookings.length < 1) {
                await room.destroy();
                return res.status(201).json({
                    message: "Delete room successful",
                    roomId: roomId
                });
            }

            for (const perBooking of bookings) {
                await perBooking.destroy();
            }

            await room.destroy();
            res.status(201).json({
                message: "Delete room successful",
                roomId: roomId
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /room/:hotelId
    async getRoomByHotelId(req, res, next) {
        try {
            const { hotelId } = req.params;
            const rooms = await Room.findAll({
                where: { HOTEL_ID: hotelId },
                include: [
                    {
                        model: db.type_room,
                        as: 'typeRoom'
                    },
                    {
                        model: db.hotel,
                        as: 'hotel'
                    }
                ],
                order: [
                    ['createdAt', 'DESC'],
                ],
            });

            const tempRooms = [];
            rooms.forEach(room => {
                const data = {
                    room_id: room.ID,
                    hotel_id: room.hotel.ID,
                    room_type_id: room.typeRoom.ID,
                    hotel: room.hotel.NAME,
                    room_type: room.typeRoom.TYPE_NAME,
                    availability: room.AVAILABILITY,
                    price: room.typeRoom.PRICE_PER_NIGHT,
                    description: room.DESCRIPTION,
                    name: room.NAME,
                    image: typeof room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${room.IMAGE.filename}` : room.IMAGE,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                };
                tempRooms.push(data);
            });

            res.status(201).json({
                message: "Get rooms successful",
                data: tempRooms
            });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new RoomController
