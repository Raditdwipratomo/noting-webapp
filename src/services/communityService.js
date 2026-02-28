const { Op, fn, col, literal } = require("sequelize");
const { sequelize, Post, Comment, Like, User } = require("../models");

class CommunityService {
  // ================================
  // CREATE POST (MULTI IMAGE READY)
  // ================================
  static async createPost({ userId, content, imageUrls = [] }) {
    return await Post.create({
      user_id: userId,
      content,
      image_url: imageUrls.length ? JSON.stringify(imageUrls) : null,
    });
  }

  // ================================
  // GET FEED (pagination ready)
  // ================================
  static async getFeed({ page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const posts = await Post.findAndCountAll({
      where: { is_deleted: false },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "nama_lengkap"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    // 🔥 parse images supaya frontend enak
    const rows = posts.rows.map((post) => {
      const plain = post.toJSON();

      return {
        ...plain,
        image_urls: plain.image_url ? JSON.parse(plain.image_url) : [],
      };
    });

    return {
      total: posts.count,
      page,
      limit,
      rows,
    };
  }

  // ================================
  // LIKE POST (ANTI DOUBLE LIKE)
  // ================================
  static async likePost({ userId, postId }) {
    return await sequelize.transaction(async (t) => {
      const existing = await Like.findOne({
        where: {
          user_id: userId,
          post_id: postId,
        },
        transaction: t,
      });

      if (existing) return existing;

      const like = await Like.create(
        {
          user_id: userId,
          post_id: postId,
        },
        { transaction: t }
      );

      await Post.increment("like_count", {
        by: 1,
        where: { id: postId },
        transaction: t,
      });

      return like;
    });
  }

  // ================================
  // UNLIKE POST
  // ================================
  static async unlikePost({ userId, postId }) {
    return await sequelize.transaction(async (t) => {
      const deleted = await Like.destroy({
        where: {
          user_id: userId,
          post_id: postId,
        },
        transaction: t,
      });

      if (deleted) {
        await Post.decrement("like_count", {
          by: 1,
          where: { id: postId },
          transaction: t,
        });
      }

      return true;
    });
  }

  // ================================
  // ADD COMMENT
  // ================================
  static async addComment({ userId, postId, content }) {
    return await sequelize.transaction(async (t) => {
      const comment = await Comment.create(
        {
          user_id: userId,
          post_id: postId,
          content,
        },
        { transaction: t }
      );

      await Post.increment("comment_count", {
        by: 1,
        where: { id: postId },
        transaction: t,
      });

      return comment;
    });
  }

  // ================================
  // REPLY COMMENT
  // ================================
  static async replyComment({ userId, postId, parentId, content }) {
    return await sequelize.transaction(async (t) => {
      const parent = await Comment.findByPk(parentId, { transaction: t });
      if (!parent) throw new Error("Parent comment tidak ditemukan");

      const reply = await Comment.create(
        {
          user_id: userId,
          post_id: postId,
          parent_id: parentId,
          content,
        },
        { transaction: t }
      );

      await Post.increment("comment_count", {
        by: 1,
        where: { id: postId },
        transaction: t,
      });

      return reply;
    });
  }

  // ================================
  // GET COMMENTS TREE
  // ================================
  static async getComments(postId) {
    return await Comment.findAll({
      where: {
        post_id: postId,
        parent_id: null,
        is_deleted: false,
      },
      include: [
        {
          model: Comment,
          as: "replies",
          where: { is_deleted: false },
          required: false,
        },
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "nama_lengkap"],
        },
      ],
      order: [["created_at", "ASC"]],
    });
  }
}

module.exports = CommunityService;