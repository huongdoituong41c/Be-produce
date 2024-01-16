module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        ID: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        FIRSTNAME: {
            allowNull: false,
            type: Sequelize.STRING
        },
        LASTNAME: {
            allowNull: false,
            type: Sequelize.STRING
        },
        EMAIL: {
            allowNull: false,
            type: Sequelize.STRING
        },
        PASSWORD: {
            allowNull: false,
            type: Sequelize.STRING
        },
        ROLE: {
            allowNull: true,
            defaultValue: 'User',
            type: Sequelize.STRING
        },
    }, {
        up: async (queryInterface, Sequelize) => {
            await queryInterface.createTable("user", {
                ID: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                FIRSTNAME: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                LASTNAME: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                EMAIL: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                PASSWORD: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                ROLE: {
                    allowNull: true,
                    defaultValue: 'User',
                    type: Sequelize.DATE
                },
            });
        },
        down: async (queryInterface, Sequelize) => {
            await queryInterface.dropTable('user');
        }
    });

    return User;
}
