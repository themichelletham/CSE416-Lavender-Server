module.exports = (sequelize, DataTypes) => {
    const Platforms = sequelize.define("Platforms", {
        platform_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            foreignKey: true,
        },
        platform_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        banner_photo: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        icon_photo: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
    });

    Platforms.associate = (models) => {
        Platforms.hasMany(models.Points, {
            foreignKey: 'platform_id',
            onDelete: "cascade",
        });
        //Platforms.hasMany(models.Quizzes, {
        //    foreignKey: 'platform_id',
        //    onDelete: "cascade",
        //});
        Platforms.belongsTo(models.Users, {
            foreignKey: 'user_id'
        });
    };
    //Platforms.belongTo(models.Users)
    return Platforms;
}
