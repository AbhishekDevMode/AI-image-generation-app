const User = require('../models/User');

const generateImage = async (req, res) => {
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

    const seed = Math.floor(Math.random() * 1000000);
    const width = aspectRatio === '16:9' ? 1024 : aspectRatio === '4:3' ? 768 : 1024;
    const height = aspectRatio === '16:9' ? 576 : aspectRatio === '4:3' ? 1024 : 1024;
    
    // const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
    const queryKeywords = encodeURIComponent(finalPrompt.split(',')[0].trim());
    // const imageUrl = `https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=${width}&auto=format&fit=crop`;
    const imageUrl = `https://source.unsplash.com/featured/${width}x${height}?${queryKeywords}`;
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`External API Failed with Status: ${response.status}`);
      return res.status(500).json({ message: 'Failed to generate image from AI provider.' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const finalPhotoUrl = `data:image/jpeg;base64,${base64Image}`;
    
    user.credits -= 1;
    await user.save();
    res.status(200).json({ photo: finalPhotoUrl, credits: user.credits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during generation' });
  }
};

module.exports = {
  generateImage,
};
