module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define(
    "Like",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },

      post_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "posts",
          key: "id",
        },
      },

      comment_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "comments",
          key: "id",
        },
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "likes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,

      indexes: [
        { fields: ["user_id"] },
        { fields: ["post_id"] },
        { fields: ["comment_id"] },

        // unique like post
        {
          unique: true,
          fields: ["user_id", "post_id"],
        },

        // unique like comment
        {
          unique: true,
          fields: ["user_id", "comment_id"],
        },
      ],
    },
  );

  // =========================
  // ASSOCIATIONS
  // =========================
  Like.associate = function (models) {
    Like.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    Like.belongsTo(models.Post, {
      foreignKey: "post_id",
      as: "post",
      onDelete: "CASCADE",
    });

    Like.belongsTo(models.Comment, {
      foreignKey: "comment_id",
      as: "comment",
      onDelete: "CASCADE",
    });
  };

  return Like;
};
