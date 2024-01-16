module.exports = (sequelize, Sequelize) => {
    const Room = sequelize.define("room", {
        ID: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        HOTEL_ID: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'hotels', // 'fathers' refers to table name
                key: 'ID', // 'id' refers to column name in fathers table
            }
        },
        ROOM_TYPE_ID: {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
                model: 'type_rooms', // 'fathers' refers to table name
                key: 'ID', // 'id' refers to column name in fathers table
            }
        },
        AVAILABILITY: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        DESCRIPTION: {
            allowNull: false,
            type: Sequelize.JSON
        },
        NAME: {
            allowNull: false,
            type: Sequelize.STRING
        },
        IMAGE: {
            allowNull: false,
            type: Sequelize.JSON
        }
    }, {
        up: async (queryInterface, Sequelize) => {
            await queryInterface.createTable("room", {
                ID: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                HOTEL_ID: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'hotels', // 'fathers' refers to table name
                        key: 'ID', // 'id' refers to column name in fathers table
                    }
                },
                ROOM_TYPE_ID: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'type_rooms', // 'fathers' refers to table name
                        key: 'ID', // 'id' refers to column name in fathers table
                    }
                },
                AVAILABILITY: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
                DESCRIPTION: {
                    allowNull: false,
                    type: Sequelize.JSON
                },
                NAME: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                IMAGE: {
                    allowNull: false,
                    type: Sequelize.JSON
                }
            });
        },
        down: async (queryInterface, Sequelize) => {
            await queryInterface.dropTable('room');
        }
    });

    // Room.belongsTo(sequelize.models.hotel, {
    //     foreignKey: 'HOTEL_ID',
    //     foreignKeyConstraint: true
    // });

    // Room.belongsTo(sequelize.models.type_room, {
    //     foreignKey: 'ROOM_TYPE_ID',
    //     as: 'typeRoom',
    //     foreignKeyConstraint: true
    // });


    return Room;
}
