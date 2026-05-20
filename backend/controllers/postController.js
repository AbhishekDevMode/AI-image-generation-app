const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const getPosts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = { prompt: { $regex: search, $options: 'i' } };
    }

    const posts = await Post.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 });
      
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const { prompt, photo, stylePreset, aspectRatio } = req.body;

    if (!prompt || !photo) {
      return res.status(400).json({ message: 'Please provide prompt and photo' });
    }

    //This  Uploads image to Cloudinary
    const photoUrl = await cloudinary.uploader.upload(photo, {
      folder: 'ai-image-generator',
      format: 'webp',
      transformation: [
    { quality: 'auto', fetch_format: 'auto' }
  ]
    });

    const newPost = await Post.create({
      user: req.user._id,
      prompt,
      imageUrl: photoUrl.secure_url,
      cloudinaryId: photoUrl.public_id,
      stylePreset,
      aspectRatio,
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error saving post' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = user.favorites.includes(post._id);
     //Liked and dislikes here
    if (isLiked) {
      // Unlike
      user.favorites = user.favorites.filter((id) => id.toString() !== post._id.toString());
      post.likesCount = post.likesCount - 1;
    } else {
      // Like
      user.favorites.push(post._id);
      post.likesCount = post.likesCount + 1;
    }

    await user.save();
    await post.save();

    res.json({ likesCount: post.likesCount, isLiked: !isLiked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error toggling like' });
  }
};

module.exports = {
  getPosts,
  createPost,
  toggleLike,
};
