const User = require('../models/User');

const generateImage = async (req, res) => {
  // 1. Explicitly enable CORS so your frontend can communicate with your backend
  res.setHeader('Access-Control-Allow-Origin', 'https://ai-image-generation-app-pi.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    
    // Clean up the text for URL safety
    const queryKeywords = encodeURIComponent(finalPrompt.trim());
    
    // 2. A true public AI image generator router (Bypasses keys, reads your prompt text perfectly)
    const imageUrl = `https://image.pollinations.ai/prompt/${queryKeywords}?width=${width}&height=${height}&nologo=true&private=true&seed=${Math.floor(Math.random() * 100000)}`;
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`API Failed with Status: ${response.status}`);
      return res.status(500).json({ message: 'Generation server is busy. Please try again.' });
    }

    // 3. Package the data stream into the base64 format your frontend wants
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
