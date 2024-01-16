module.exports = (sequelize, Sequelize) => {
    const ConfirmationStatus = sequelize.define("confirmationStatus", {
        ID: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        NAME: {
            allowNull: false,
            type: Sequelize.STRING
        },
    }, {
        up: async (queryInterface, Sequelize) => {
            await queryInterface.createTable("confirmationStatus", {
                ID: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                NAME: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
            });
        },
        down: async (queryInterface, Sequelize) => {
            await queryInterface.dropTable('confirmationStatus');
        }
    });

    // Hotel.associate = (models) => {
    //     Hotel.hasMany(models.room, {
    //         foreignKey: 'HOTEL_ID',
    //     });
    // };
    
    return ConfirmationStatus;
}
