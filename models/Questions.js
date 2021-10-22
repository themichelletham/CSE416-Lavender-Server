module.exports = (sequelize, DataTypes) => {
    const Questions = sequelize.define("Questions", {
        question_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        quiz_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            //foreignKey: true,
        },
        question_text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })

    Questions.associate = (models) => {
        Questions.hasMany(models.Answers, {
            foreignKey: {
                name: 'question_id',
                allowNull: false,
            },
            onDelete: "cascade",
        });
        Questions.hasMany(models.UserAnswers, {
            foreignKey: {
                name: 'question_id',
                allowNull: false,
            },
            onDelete: 'cascade',
        });
        //Questions.belongsTo(models.Quizzes, {
        //    foreignKey: 'quiz_id'
        //});
    };
    
    return Questions;
}
