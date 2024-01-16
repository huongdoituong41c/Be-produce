module.exports = (sequelize, Sequelize) => {
    const TypeRoom = sequelize.define("type_room", {
        ID: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        TYPE_NAME: {
            allowNull: false,
            type: Sequelize.STRING
        },
        PRICE_PER_NIGHT: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
    }, {
        up: async (queryInterface, Sequelize) => {
            await queryInterface.createTable("type_room", {
                ID: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                TYPE_NAME: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                PRICE_PER_NIGHT: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
            });
        },
        down: async (queryInterface, Sequelize) => {
            await queryInterface.dropTable('type_room');
        }
    });

    // TypeRoom.belongsTo(sequelize.models.room, {
    //     foreignKey: 'ROOM_TYPE_ID',
    //     as: 'rooms'
    // });

    // TypeRoom.associate = (models) => {
    //     TypeRoom.hasOne(models.room, {
    //         foreignKey: 'ROOM_TYPE_ID',
    //     });
    // };

    return TypeRoom;
}
