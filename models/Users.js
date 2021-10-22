module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })

    Users.associate = (models) => {
        Users.hasMany(models.Points, {
            foreignKey: 'user_id',
            onDelete: "cascade",
        });
        
        Users.hasMany(models.UserAnswers, {
            foreignKey: 'user_id',
            onDelete: "cascade",
        });

        Users.hasMany(models.History, {
            foreignKey: 'user_id',
            onDelete: 'cascade',
        });

        Users.hasOne(models.Platforms, {
            foreignKey: 'user_id',
            onDelete: 'cascade',
        });
    };
    return Users;
}
