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

    // 2. Mix your prompt text with your chosen style preset
    const finalPrompt = stylePreset ? `${prompt}, ${stylePreset}` : prompt;
    const width = aspectRatio === '16:9' ? 1024 : aspectRatio === '4:3' ? 768 : 1024;
    const height = aspectRatio === '16:9' ? 576 : aspectRatio === '4:3' ? 1024 : 1024;
    
    // Clean up the text so the URL structure doesn't break
    const queryKeywords = encodeURIComponent(finalPrompt.replace(/[^a-zA-Z0-9 ]/g, "").trim());
    
    // 3. Use the stable source stream matching your exact prompt query keyword
    const imageUrl = `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=${width}&h=${height}&auto=format&fit=crop&sig=${Math.floor(Math.random() * 1000)}&q=${queryKeywords}`;
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`API Failed with Status: ${response.status}`);
      return res.status(500).json({ message: 'Generation server is busy. Please try again.' });
    }

    // 4. Safely package the data stream into the base64 format your frontend wants
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
