module.exports = (sequelize, DataTypes) => {
    const History = sequelize.define("History", {
        history_id: {
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
        quiz_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            //foreignKey: true,
        },
        duration: {
            type: DataTypes.TIME,
            allowNull: true,
        },
    })
    History.associate = (models) => {
        History.belongsTo(models.Users, {
            foreignKey: 'user_id'
        });
        //History.belongsTo(models.Quizzes, {
        //    foreignKey: 'quiz_id'
        //});
    };
    return History;
}
