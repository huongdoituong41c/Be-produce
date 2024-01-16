const db = require('../../config/db/index.js');
const ConfirmationStatus = db.confirmationStatus;

class ConfirmationStatusController {

    //[GET] /status
    async index(req, res, next) {
        try {
            const confirmationStatuses = await ConfirmationStatus.findAll();
            const tempConfirmationStatuses = [];
            confirmationStatuses.forEach(confirmationStatus => {
                const data = {
                    id: confirmationStatus.ID,
                    name: confirmationStatus.NAME,
                    createdAt: confirmationStatus.createdAt,
                    updatedAt: confirmationStatus.updatedAt
                };
                tempConfirmationStatuses.push(data);
            });

            res.status(201).json({
                message: "Get status successful",
                data: tempConfirmationStatuses
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /status/create
    async addStatus(req, res, next) {
        try {
            const { name } = req.body;

            let created_status = await ConfirmationStatus.create({ NAME: name });

            res.status(201).json({
                message: "Add status successful",
                data: {
                    confirmation_status_id: created_status.ID,
                    name: created_status.NAME,
                    createdAt: created_status.createdAt,
                    updatedAt: created_status.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /status/update/:statusId
    async updateStatus(req, res, next) {
        try {
            const { statusId } = req.params;
            const { name } = req.body;

            const status = await ConfirmationStatus.findByPk(statusId);
            if (!status) {
                return res.status(401).json({ message: "Status confirmation not found" });
            }

            await status.update({ NAME: name });
            let updated_status = await status.save();

            res.status(201).json({
                message: "Update status successful",
                data: {
                    confirmation_status_id: updated_status.ID,
                    name: updated_status.NAME,
                    createdAt: updated_status.createdAt,
                    updatedAt: updated_status.updatedAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    //[DELETE] /status/delete/:statusId
    async deleteStatus(req, res, next) {
        try {
            const { statusId } = req.params;

            const status = await ConfirmationStatus.findByPk(statusId);
            if (!status) {
                return res.status(401).json({ message: "Status confirmation not found" });
            }

            await status.destroy();

            res.status(201).json({
                message: "Delete status successful",
                statusId: statusId
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ConfirmationStatusController;
