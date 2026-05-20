const express = require('express');
const { getPosts, createPost, toggleLike } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
