const db = require('../../config/db/index.js');
const TypeRoom = db.type_room;

class RoomTypeController {

    //[GET] /typeRoom
    async index(req, res, next) {
        try {
            let typeRooms = await TypeRoom.findAll({});
            let tempTypeRooms = [];
            typeRooms.forEach(typeRoom => {
                const data = {
                    type_room_id: typeRoom.ID,
                    type_name: typeRoom.TYPE_NAME,
                    price_per_night: typeRoom.PRICE_PER_NIGHT,
                    createdAt: typeRoom.createdAt,
                    updatedAt: typeRoom.updatedAt
                }
                tempTypeRooms.push(data)
            });

            res.status(201).json({
                message: "Get type rooms successful",
                data: tempTypeRooms
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /typeRoom/:typeRoomId
    async getTypeRoom(req, res, next) {
        try {
            const { typeRoomId } = req.params;

            const typeRoom = await TypeRoom.findByPk(typeRoomId);
            if (!typeRoom) {
                return res.status(401).json({ message: "type room not found" });
            }

            res.status(201).json({
                message: "Get type room successful",
                data: {
                    type_room_id: typeRoom.ID,
                    type_name: typeRoom.TYPE_NAME,
                    price_per_night: typeRoom.PRICE_PER_NIGHT,
                    createdAt: typeRoom.createdAt,
                    updatedAt: typeRoom.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /typeRoom/create
    async addTypeRoom(req, res, next) {
        try {
            const { typeName, pricePerNight } = req.body;

            var typeRoom = {
                TYPE_NAME: typeName,
                PRICE_PER_NIGHT: pricePerNight
            };
            let created_typeRoom = await TypeRoom.create(typeRoom);

            res.status(201).json({
                message: "Add type room successful",
                data: {
                    type_room_id: created_typeRoom.ID,
                    type_name: created_typeRoom.TYPE_NAME,
                    price_per_night: created_typeRoom.PRICE_PER_NIGHT,
                    createdAt: created_typeRoom.createdAt,
                    updatedAt: created_typeRoom.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /typeRoom/update/:typeRoomId
    async updateTypeRoom(req, res, next) {
        try {
            const { typeRoomId } = req.params;
            const { typeName, pricePerNight } = req.body;

            const typeRoom = await TypeRoom.findByPk(typeRoomId);
            if (!typeRoom) {
                return res.status(401).json({ message: "Type room not found" });
            };

            var tR = {
                TYPE_NAME: typeName,
                PRICE_PER_NIGHT: pricePerNight
            };
            await typeRoom.update(tR);
            const typeRoomUpdate = await typeRoom.save();

            res.status(201).json({
                message: "Update type room successful",
                data: {
                    type_room_id: typeRoomUpdate.ID,
                    type_name: typeRoomUpdate.TYPE_NAME,
                    price_per_night: typeRoomUpdate.PRICE_PER_NIGHT,
                    createdAt: typeRoomUpdate.createdAt,
                    updatedAt: typeRoomUpdate.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /typeRoom/delete/:typeRoomId
    async deleteTypeRoom(req, res, next) {
        try {
            const { typeRoomId } = req.params;

            const typeRoom = await TypeRoom.findByPk(typeRoomId);
            if (!typeRoom) {
                return res.status(401).json({ message: "Type room not found" });
            };

            await typeRoom.destroy();

            res.status(201).json({
                message: "Delete type room successful",
                typeRoomId: typeRoomId
            });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new RoomTypeController;
