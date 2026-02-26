module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
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

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 5000], // optional limit
        },
      },

      like_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      comment_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
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
      tableName: "posts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      indexes: [
        { fields: ["user_id"] },
        { fields: ["created_at"] },
        { fields: ["is_deleted"] },
      ],
    }
  );

  // =========================
  // ASSOCIATIONS
  // =========================
  Post.associate = function (models) {
    Post.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    Post.hasMany(models.Comment, {
      foreignKey: "post_id",
      as: "comments",
      onDelete: "CASCADE",
      hooks: true,
    });

    Post.hasMany(models.Like, {
      foreignKey: "post_id",
      as: "likes",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Post;
};