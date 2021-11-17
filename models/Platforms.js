module.exports = (sequelize, DataTypes) => {
    const Platforms = sequelize.define("Platforms", {
        platform_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            foreignKey: true,
        },
        platform_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        banner_photo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        icon_photo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });

    Platforms.associate = (models) => {
        Platforms.hasMany(models.Points, {
            foreignKey: 'platform_id',
            onDelete: "cascade",
            hooks: true,
        });
        Platforms.hasMany(models.Quizzes, {
            foreignKey: 'platform_id',
            onDelete: "cascade",
            hooks: true,
        });
        Platforms.belongsTo(models.Users, {
            foreignKey: 'user_id'
        });
    };
    return Platforms;
}
