module.exports = (sequelize, DataTypes) => {
  const Quizzes = sequelize.define("Quizzes", {
    quiz_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    quiz_name: {
      type: DataTypes.STRING,
      allowNull: true // testing,
    },
    platform_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      foreignKey: true,
    },
    time_limit: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    icon_photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  })

  Quizzes.associate = (models) => {
    Quizzes.hasMany(models.Questions, {
      foreignKey: 'quiz_id',
      onDelete: "cascade",
      hooks: true,
    });
    Quizzes.hasMany(models.History, {
      foreignKey: 'quiz_id',
      onDelete: "cascade",
      hooks: true,
    });
    Quizzes.belongsTo(models.Platforms, {
      foreignKey: 'platform_id'
    });
  };
  return Quizzes;
}
