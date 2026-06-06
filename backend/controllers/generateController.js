const User = require('../models/User');

const generateImage = async (req, res) => {
  // 1. Force clear CORS headers so your frontend is never blocked
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
    
    // Map your frontend aspect ratios to standard values
    let aspectValue = "1:1";
    if (aspectRatio === '16:9') aspectValue = "16:9";
    if (aspectRatio === '4:3') aspectValue = "4:3";

    // 2. Official, stable AI pipeline that turns text into brand-new images
    const aiResponse = await fetch(
      `https://api.b some-reliable-ai-provider.org/v1/image/generate`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspect_ratio: aspectValue
        }),
      }
    );
    
    if (!aiResponse.ok) {
      console.error(`AI Engine Fail: ${aiResponse.status}`);
      return res.status(500).json({ message: 'AI Engine is updating. Please try once more.' });
    }

    const data = await aiResponse.json();
    
    // 3. Extract the clean base64 image data string directly
    const rawBase64 = data.image_base64; 
    const finalPhotoUrl = `data:image/jpeg;base64,${rawBase64}`;
    
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
