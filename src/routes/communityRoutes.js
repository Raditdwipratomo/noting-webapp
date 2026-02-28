const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const uploadCommunity = require("../middleware/uploadCommunity");
const CommunityController = require("../controllers/communityController");

const router = express.Router();

// semua route private
router.use(authenticate);

/**
 * =====================================================
 * POSTS
 * =====================================================
 */

/**
 * @route   POST /api/community/posts
 * @desc    Create new community post
 * @access  Private
 */
router.post(
  "/posts",
  uploadCommunity.array("images", 4),
  CommunityController.createPost
);

/**
 * @route   GET /api/community/feed
 * @desc    Get community feed (paginated)
 * @access  Private
 */
router.get("/feed", CommunityController.getFeed);

/**
 * =====================================================
 * LIKES
 * =====================================================
 */

/**
 * @route   POST /api/community/posts/:postId/like
 * @desc    Like a post
 * @access  Private
 */
router.post("/posts/:postId/like", CommunityController.likePost);

/**
 * @route   DELETE /api/community/posts/:postId/like
 * @desc    Unlike a post
 * @access  Private
 */
router.delete("/posts/:postId/like", CommunityController.unlikePost);

/**
 * =====================================================
 * COMMENTS
 * =====================================================
 */

/**
 * @route   POST /api/community/posts/:postId/comments
 * @desc    Add comment to post
 * @access  Private
 */
router.post(
  "/posts/:postId/comments",
  CommunityController.addComment
);

/**
 * @route   POST /api/community/posts/:postId/comments/:commentId/reply
 * @desc    Reply to a comment
 * @access  Private
 */
router.post(
  "/posts/:postId/comments/:commentId/reply",
  CommunityController.replyComment
);

/**
 * @route   GET /api/community/posts/:postId/comments
 * @desc    Get comments tree for a post
 * @access  Private
 */
router.get(
  "/posts/:postId/comments",
  CommunityController.getComments
);

module.exports = router;