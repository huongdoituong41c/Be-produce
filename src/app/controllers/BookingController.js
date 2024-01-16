const db = require('../../config/db/index.js');
const Booking = db.booking;
const Room = db.room;
const nodemailer = require('nodemailer');
class BookingController {

    //[GET] /booking?page=&limit=
    async index(req, res, next) {
        try {
            const { page, limit } = req.query;
            const offset = (page - 1) * limit;

            const bookings = await Booking.findAll({
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
                        include: [
                            {
                                model: db.hotel,
                                as: 'hotel',
                                order: [
                                    ['NAME', 'DESC'],
                                ]
                            }
                        ]
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            });

            let tempBookings = [];
            switch (req.user.ROLE) {
                case "Super Admin":
                    bookings.forEach(booking => {
                        const data = {
                            booking_id: booking.ID,
                            user_id: booking.user.ID,
                            user: booking.user.EMAIL,
                            room_id: booking.room.ID,
                            room: booking.room.NAME,
                            hotel_id: booking.room.hotel.ID,
                            hotel: booking.room.hotel.NAME,
                            checkInDate: booking.CHECK_IN_DATE,
                            checkOutDate: booking.CHECK_OUT_DATE,
                            numberOfGuests: booking.NUMBER_OF_GUESTS,
                            numberOfRooms: booking.NUMBER_OF_ROOMS,
                            totalPrice: booking.TOTAL_PRICE,
                            status: booking.confirmation_status.NAME,
                            createdAt: booking.createdAt,
                            updatedAt: booking.updatedAt
                        };
                        tempBookings.push(data);
                    });
                    break;
                case "Admin":
                    bookings.forEach(async (booking) => {
                        if (booking.room.hotel.USER_ID === req.user.ID) {
                            const data = {
                                booking_id: booking.ID,
                                user_id: booking.user.ID,
                                user: booking.user.EMAIL,
                                room_id: booking.room.ID,
                                room: booking.room.NAME,
                                hotel_id: booking.room.hotel.ID,
                                hotel: booking.room.hotel.NAME,
                                checkInDate: booking.CHECK_IN_DATE,
                                checkOutDate: booking.CHECK_OUT_DATE,
                                numberOfGuests: booking.NUMBER_OF_GUESTS,
                                numberOfRooms: booking.NUMBER_OF_ROOMS,
                                totalPrice: booking.TOTAL_PRICE,
                                status: booking.confirmation_status.NAME,
                                createdAt: booking.createdAt,
                                updatedAt: booking.updatedAt
                            };
                            tempBookings.push(data);
                        }
                    });
                    break;
                default:
                    tempBookings = [];
                    break;
            }
            const totalBookings = await Booking.count();
            const dataBookings = tempBookings.slice(parseInt(offset), parseInt(offset) + parseInt(limit))

            res.status(201).json({
                message: "Get bookings successful",
                data: dataBookings,
                totalCount: totalBookings
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /booking/userBooking
    async getBookingByUser(req, res, next) {
        try {
            const userId = req.user.ID;
            const { page, limit } = req.query;
            let bookings;
            if (page && limit) {
                const offset = (page - 1) * limit;
                bookings = await Booking.findAll({
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                    where: {
                        USER_ID: userId
                    },
                    include: [
                        {
                            model: db.user,
                            as: 'user',
                        },
                        {
                            model: db.room,
                            as: 'room',
                            include: [
                                {
                                    model: db.hotel,
                                    as: 'hotel'
                                }
                            ]
                        },
                        {
                            model: db.confirmationStatus,
                            as: 'confirmation_status',
                        }
                    ],
                    order: [
                        ['createdAt', 'DESC'],
                    ]
                })
            } else {
                bookings = await Booking.findAll({
                    where: {
                        USER_ID: userId
                    },
                    include: [
                        {
                            model: db.user,
                            as: 'user',
                        },
                        {
                            model: db.room,
                            as: 'room',
                            include: [
                                {
                                    model: db.hotel,
                                    as: 'hotel'
                                }
                            ]
                        },
                        {
                            model: db.confirmationStatus,
                            as: 'confirmation_status',
                        }
                    ],
                    order: [
                        ['createdAt', 'DESC'],
                    ]
                })
            }

            const totalBookings = await Booking.count();
            const tempBookings = [];
            bookings.forEach(booking => {
                const data = {
                    booking_id: booking.ID,
                    user_id: booking.user.ID,
                    user: booking.user.EMAIL,
                    room_id: booking.room.ID,
                    room: booking.room.NAME,
                    hotel_id: booking.room.hotel.ID,
                    hotel: booking.room.hotel.NAME,
                    checkInDate: booking.CHECK_IN_DATE,
                    checkOutDate: booking.CHECK_OUT_DATE,
                    numberOfGuests: booking.NUMBER_OF_GUESTS,
                    numberOfRooms: booking.NUMBER_OF_ROOMS,
                    totalPrice: booking.TOTAL_PRICE,
                    status: booking.confirmation_status.NAME,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt
                };
                tempBookings.push(data);
            });

            res.status(201).json({
                message: "Get booking of user successful",
                data: tempBookings,
                totalCount: totalBookings
            });
        } catch (error) {
            next(error);
        }
    }

    //[POST] /booking/create
    async addBooking(req, res, next) {
        try {
            const { userId, roomId, checkInDate, checkOutDate, numberOfGuests, numberOfRooms } = req.body;
            const covertCheckInDate = new Date(checkInDate);
            const covertcheckOutDate = new Date(checkOutDate);
            let totalPrice;

            const roomAvailable = await Room.findOne({
                where: {
                    ID: roomId
                },
                include: [
                    {
                        model: db.type_room,
                        as: 'typeRoom'
                    }
                ]
            });

            if (!roomAvailable) {
                return res.status(401).json({ message: "Not found room" });
            };

            if (roomAvailable.AVAILABILITY == 0) {
                return res.status(401).json({ message: "These kind of rooms were not available" });
            };


            if (numberOfRooms > roomAvailable.AVAILABILITY) {
                return res.status(401).json({ message: "We only have " + roomAvailable.AVAILABILITY + " rooms available." });
            };

            if (covertCheckInDate && covertcheckOutDate) {
                const getTime = covertcheckOutDate.getTime() - covertCheckInDate.getTime();
                const getDays = getTime / (1000 * 3600 * 24);
                const parseDays = parseInt(getDays);

                if (parseDays == 1) {
                    totalPrice = numberOfRooms * roomAvailable.typeRoom.PRICE_PER_NIGHT;
                } else if (parseDays >= 2) {
                    totalPrice = numberOfRooms * roomAvailable.typeRoom.PRICE_PER_NIGHT * parseDays;
                }
            };

            var bk = {
                USER_ID: userId,
                ROOM_ID: roomId,
                CHECK_IN_DATE: checkInDate,
                CHECK_OUT_DATE: checkOutDate,
                NUMBER_OF_GUESTS: numberOfGuests,
                NUMBER_OF_ROOMS: numberOfRooms,
                TOTAL_PRICE: totalPrice,
                CONFIRMATION_STATUS_ID: 1
            }

            const created_booking = await Booking.create(bk);

            const booking = await Booking.findOne({
                where: { ID: created_booking.ID },
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
                        include: [
                            {
                                model: db.hotel,
                                as: 'hotel'
                            }
                        ]
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            });

            if (!booking) {
                return res.status(401).json({ message: "Booking not found" });
            }

            const room = await db.room.findByPk(booking.room.ID);
            await room.update({ AVAILABILITY: room.AVAILABILITY - booking.NUMBER_OF_ROOMS });
            await room.save();

            res.status(201).json({
                message: "Add booking successful",
                data: {
                    booking_id: booking.ID,
                    user_id: booking.user.ID,
                    user: booking.user.EMAIL,
                    room_id: booking.room.ID,
                    room: booking.room.NAME,
                    hotel_id: booking.room.hotel.ID,
                    hotel: booking.room.hotel.NAME,
                    checkInDate: booking.CHECK_IN_DATE,
                    checkOutDate: booking.CHECK_OUT_DATE,
                    numberOfGuests: booking.NUMBER_OF_GUESTS,
                    numberOfRooms: booking.NUMBER_OF_ROOMS,
                    totalPrice: booking.TOTAL_PRICE,
                    status: booking.confirmation_status.NAME,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    //[PATCH] /booking/updateStatus/:bookingId
    async updateStatus(req, res, next) {
        try {
            const { bookingId } = req.params;

            const booking = await Booking.findByPk(bookingId, {
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
                        include: [
                            {
                                model: db.hotel,
                                as: 'hotel'
                            }
                        ]
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            });
            if (!booking) {
                return res.status(401).json({ message: "Booking not found" });
            }

            const { bookingStatusId } = req.body;
            if (bookingStatusId > 3) {
                return res.status(400).json({ message: "Status to update is invalid" });
            }

            if (req.user.ROLE === 'User' && bookingStatusId === 2 && booking.room.hotel.USER_ID !== req.user.ID) {
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }

            if (bookingStatusId === 3 && (req.user.ID !== booking.USER_ID && req.user.ROLE !== "Super Admin" && req.user.ID !== booking.room.hotel.USER_ID)) {
                return res.status(401).json({ message: 'Not allow' });
            }

            await booking.update({ CONFIRMATION_STATUS_ID: bookingStatusId });
            await booking.save();

            const updated_bookingStatus = await Booking.findByPk(booking.ID, {
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
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
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            });

            if (updated_bookingStatus.CONFIRMATION_STATUS_ID === 3) {
                const room = await db.room.findByPk(updated_bookingStatus.room.ID);
                await room.update({ AVAILABILITY: room.AVAILABILITY + updated_bookingStatus.NUMBER_OF_ROOMS });
                await room.save();

                return res.status(201).json({
                    message: "Update status booking successful",
                    data: {
                        booking_id: updated_bookingStatus.ID,
                        user_id: updated_bookingStatus.user.ID,
                        user: updated_bookingStatus.user.EMAIL,
                        room_id: updated_bookingStatus.room.ID,
                        room: updated_bookingStatus.room.NAME,
                        hotel_id: updated_bookingStatus.room.hotel.ID,
                        hotel: updated_bookingStatus.room.hotel.NAME,
                        checkInDate: updated_bookingStatus.CHECK_IN_DATE,
                        checkOutDate: updated_bookingStatus.CHECK_OUT_DATE,
                        numberOfGuests: updated_bookingStatus.NUMBER_OF_GUESTS,
                        numberOfRooms: updated_bookingStatus.NUMBER_OF_ROOMS,
                        totalPrice: updated_bookingStatus.TOTAL_PRICE,
                        status: updated_bookingStatus.confirmation_status.NAME,
                        createdAt: updated_bookingStatus.createdAt,
                        updatedAt: updated_bookingStatus.updatedAt
                    }
                });
            } else {
                try {
                    const Transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "sonbui2522@gmail.com",
                            pass: "ewrfhjrdwcydpyfp",
                        },
                    });
                    //covert to Arrival Date
                    const originalArrivalDate = new Date(updated_bookingStatus.CHECK_IN_DATE);
                    const adjustedArrivalDate = new Date(originalArrivalDate.getTime() - originalArrivalDate.getTimezoneOffset() * 60000 - 7 * 3600000);
                    const formattedArrivalDate = adjustedArrivalDate.toLocaleString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                    });

                    //covert to Departure Date
                    const originalDepartureDate = new Date(updated_bookingStatus.CHECK_OUT_DATE);
                    const adjustedDepartureDate = new Date(originalDepartureDate.getTime() - originalDepartureDate.getTimezoneOffset() * 60000 - 7 * 3600000);
                    const formattedDepartureDate = adjustedDepartureDate.toLocaleString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                    });

                    await Transporter.sendMail({
                        from: "sonbui2522@gmail.com",
                        to: `${updated_bookingStatus.user.EMAIL}`,
                        subject: "Approve booking",
                        html: `
                        <h1 style="color: #333; font-size: 24px; font-weight: 600;">Your Booking is Confirmed!</h1>
                        <p style="font-size: 16px;">Dear ${updated_bookingStatus.user.FIRSTNAME + " " + updated_bookingStatus.user.LASTNAME},</p>
                        <p style="font-size: 16px;">We're delighted to confirm your booking room!</p>
                        <p style="font-size: 16px;">Here are the details of your reservation:</p>
                        <ul style="list-style: none; padding: 0;">
                          <li style="margin-bottom: 10px;">Reservation Number: ${updated_bookingStatus.ID}</li>
                          <li style="margin-bottom: 10px;">Arrival Date: ${formattedArrivalDate}</li>
                          <li style="margin-bottom: 10px;">Departure Date: ${formattedDepartureDate}</li>
                          <li style="margin-bottom: 10px;">Room Type: ${updated_bookingStatus.room.typeRoom.TYPE_NAME}</li>
                          <li style="margin-bottom: 10px;">Number of Guests: ${updated_bookingStatus.NUMBER_OF_GUESTS}</li>
                          <li style="margin-bottom: 10px;">Number of Rooms: ${updated_bookingStatus.NUMBER_OF_ROOMS}</li>
                          <li style="margin-bottom: 10px;">Total Price: ${updated_bookingStatus.TOTAL_PRICE}</li>
                        </ul>
                        <p style="font-size: 16px;">We look forward to welcoming you soon!</p>
                        `,
                    });
                } catch (error) {
                    console.error("Error sending email:", emailError);
                    return res.status(500).json({ message: "Failed to send email" });
                }

                res.status(201).json({
                    message: "Update status booking successful",
                    data: {
                        booking_id: updated_bookingStatus.ID,
                        user_id: updated_bookingStatus.user.ID,
                        user: updated_bookingStatus.user.EMAIL,
                        room_id: updated_bookingStatus.room.ID,
                        room: updated_bookingStatus.room.NAME,
                        hotel_id: updated_bookingStatus.room.hotel.ID,
                        hotel: updated_bookingStatus.room.hotel.NAME,
                        checkInDate: updated_bookingStatus.CHECK_IN_DATE,
                        checkOutDate: updated_bookingStatus.CHECK_OUT_DATE,
                        numberOfGuests: updated_bookingStatus.NUMBER_OF_GUESTS,
                        numberOfRooms: updated_bookingStatus.NUMBER_OF_ROOMS,
                        totalPrice: updated_bookingStatus.TOTAL_PRICE,
                        status: updated_bookingStatus.confirmation_status.NAME,
                        createdAt: updated_bookingStatus.createdAt,
                        updatedAt: updated_bookingStatus.updatedAt
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }

    //[DELETE] /booking/delete/:bookingId
    async deleteBooking(req, res, next) {
        try {
            const { bookingId } = req.params;

            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(401).json({ message: "Booking not found" });
            }

            await booking.destroy();

            res.status(201).json({
                message: "Delete booking successful",
                bookingId: bookingId
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController
