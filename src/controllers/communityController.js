const CommunityService = require("../services/communityService");

class CommunityController {
  // =========================
  // CREATE POST
  // =========================
  static async createPost(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { content } = req.body;

      // ✅ MULTIPLE IMAGES
      const imageUrls = req.files?.length
        ? req.files.map(file => `/images/komunitas/${file.filename}`)
        : [];

      const post = await CommunityService.createPost({
        userId,
        content,
        imageUrls, 
      });

      return res.status(201).json({
        success: true,
        message: "Post berhasil dibuat",
        data: post,
      });
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // GET FEED
  // =========================
  static async getFeed(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await CommunityService.getFeed({
        page,
        limit,
      });

      return res.json({
        success: true,
        message: "Feed berhasil diambil",
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // LIKE POST
  // =========================
  static async likePost(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { postId } = req.params;

      const like = await CommunityService.likePost({
        userId,
        postId,
      });

      return res.json({
        success: true,
        message: "Post berhasil di-like",
        data: like,
      });
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // UNLIKE POST
  // =========================
  static async unlikePost(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { postId } = req.params;

      await CommunityService.unlikePost({
        userId,
        postId,
      });

      return res.json({
        success: true,
        message: "Like berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // ADD COMMENT
  // =========================
  static async addComment(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { postId } = req.params;
      const { content } = req.body;

      const comment = await CommunityService.addComment({
        userId,
        postId,
        content,
      });

      return res.status(201).json({
        success: true,
        message: "Komentar berhasil ditambahkan",
        data: comment,
      });
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // REPLY COMMENT
  // =========================
  static async replyComment(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { postId, commentId } = req.params;
      const { content } = req.body;

      const reply = await CommunityService.replyComment({
        userId,
        postId,
        parentId: commentId,
        content,
      });

      return res.status(201).json({
        success: true,
        message: "Balasan komentar berhasil",
        data: reply,
      });
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // GET COMMENTS
  // =========================
  static async getComments(req, res, next) {
    try {
      const { postId } = req.params;

      const comments = await CommunityService.getComments(postId);

      return res.json({
        success: true,
        message: "Komentar berhasil diambil",
        data: comments,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CommunityController;