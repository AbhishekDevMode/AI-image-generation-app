const User = require('../models/User');

const generateImage = async (req, res) => {
  // 1. Force explicit CORS headers to unblock the frontend completely
  res.setHeader('Access-Control-Allow-Origin', 'https://ai-image-generation-app-pi.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Instantly handle preflight browser options requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { prompt, aspectRatio = '1:1', stylePreset } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.credits <= 0) {
      return res.status(403).json({ message: 'No credits remaining. Please upgrade or wait for reset.' });
    }

    if (!prompt) {
      return res.status(400).json({ message: 'Please provide a prompt' });
    }

    const finalPrompt = stylePreset ? `${prompt}, ${stylePreset}` : prompt;
    const width = aspectRatio === '16:9' ? 1024 : aspectRatio === '4:3' ? 768 : 1024;
    const height = aspectRatio === '16:9' ? 576 : aspectRatio === '4:3' ? 1024 : 1024;
    
    // Clean up text characters for direct URL safety
    const cleanPrompt = encodeURIComponent(finalPrompt.trim());
    
    // Generate a completely unique random seed value to bypass cached rate limits
    const randomSeed = Math.floor(Math.random() * 9999999);
    
    // 2. Open-source, unauthenticated, true AI generation endpoint with custom settings
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&private=true&seed=${randomSeed}`;
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`AI Cluster Error: ${response.status}`);
      return res.status(500).json({ message: 'AI cluster is recycling. Please try again in a moment.' });
    }

    // 3. Convert the generated raw AI image safely to base64 for your layout
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const finalPhotoUrl = `data:image/jpeg;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
    
    user.credits -= 1;
    await user.save();
    return res.status(200).json({ photo: finalPhotoUrl, credits: user.credits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during generation' });
  }
};

module.exports = {
  generateImage,
};
