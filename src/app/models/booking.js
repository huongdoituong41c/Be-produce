module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define("booking", {
        ID: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        USER_ID: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'users', // 'fathers' refers to table name
                key: 'ID', // 'id' refers to column name in fathers table
            }
        },
        ROOM_ID: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'rooms', // 'fathers' refers to table name
                key: 'ID', // 'id' refers to column name in fathers table
            }
        },
        CHECK_IN_DATE: {
            allowNull: false,
            type: Sequelize.DATE
        },
        CHECK_OUT_DATE: {
            allowNull: false,
            type: Sequelize.DATE
        },
        NUMBER_OF_GUESTS: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        NUMBER_OF_ROOMS: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        TOTAL_PRICE: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        CONFIRMATION_STATUS_ID: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'confirmationStatuses', // 'fathers' refers to table name
                key: 'ID', // 'id' refers to column name in fathers table
            }
        },
    }, {
        up: async (queryInterface, Sequelize) => {
            await queryInterface.createTable("booking", {
                ID: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                USER_ID: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'users', // 'fathers' refers to table name
                        key: 'ID', // 'id' refers to column name in fathers table
                    }
                },
                ROOM_ID: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'rooms', // 'fathers' refers to table name
                        key: 'ID', // 'id' refers to column name in fathers table
                    }
                },
                CHECK_IN_DATE: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                CHECK_OUT_DATE: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                NUMBER_OF_GUESTS: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
                NUMBER_OF_ROOMS: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
                TOTAL_PRICE: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
                CONFIRMATION_STATUS_ID: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'confirmationstatuses', // 'fathers' refers to table name
                        key: 'ID', // 'id' refers to column name in fathers table
                    }
                },
            });
        },
        down: async (queryInterface, Sequelize) => {
            await queryInterface.dropTable('booking');
        }
    });

    return Booking;
}
