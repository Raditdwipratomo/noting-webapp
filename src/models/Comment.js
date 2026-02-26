module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      post_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "posts",
          key: "id",
        },
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },

      parent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "comments",
          key: "id",
        },
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 3000],
        },
      },

      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "comments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      indexes: [
        { fields: ["post_id"] },
        { fields: ["user_id"] },
        { fields: ["parent_id"] },
        { fields: ["created_at"] },
      ],
    }
  );

  // =========================
  // ASSOCIATIONS
  // =========================
  Comment.associate = function (models) {
    // owner
    Comment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    // post
    Comment.belongsTo(models.Post, {
      foreignKey: "post_id",
      as: "post",
      onDelete: "CASCADE",
    });

    // parent comment (reply)
    Comment.belongsTo(models.Comment, {
      foreignKey: "parent_id",
      as: "parent",
      onDelete: "CASCADE",
    });

    // replies
    Comment.hasMany(models.Comment, {
      foreignKey: "parent_id",
      as: "replies",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Comment;
};