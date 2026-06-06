const User = require('../models/User');

const generateImage = async (req, res) => {
  // 1. Manually add CORS headers to stop the preflight block
  res.setHeader('Access-Control-Allow-Origin', 'https://ai-image-generation-app-pi.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS requests immediately
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

    // 2. Use Cloudflare's stable, keyless Stable Diffusion XL AI pipeline
    const aiResponse = await fetch(
      `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: finalPrompt }),
      }
    );
    
    if (!aiResponse.ok) {
      console.error(`AI Engine Failed with Status: ${aiResponse.status}`);
      return res.status(500).json({ message: 'AI generation engine is busy. Please try again.' });
    }

    // 3. Convert the safe AI image stream into the base64 string your React frontend wants
    const blob = await aiResponse.blob();
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
