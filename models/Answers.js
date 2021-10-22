module.exports = (sequelize, DataTypes) => {
    const Answers = sequelize.define("Answers", {
        answer_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        question_id:{
            type: DataTypes.BIGINT,
            allowNull: false,
            foreignKey: true,
        },
        answer_text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    })

    Answers.associate = (models) => {
        Answers.belongsTo(models.Questions, {
            foreignKey: 'question_id'
        });
    }
    return Answers;
}
