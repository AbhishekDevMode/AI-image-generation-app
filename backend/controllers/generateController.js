const User = require('../models/User');

const generateImage = async (req, res) => {
  // 1. Force explicit CORS headers to unblock your frontend
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

    // 2. Official Hugging Face Production Pipeline (Stable Diffusion XL)
    // REPLACE PASTE_YOUR_HF_TOKEN_HERE WITH YOUR COPIED TOKEN
    const hfToken = "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";

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: finalPrompt }),
      }
    );
    
    if (!response.ok) {
      const errLog = await response.text();
      console.error(`Hugging Face Error: ${response.status} - ${errLog}`);
      return res.status(500).json({ message: 'AI engine is initializing. Please try again in 5 seconds.' });
    }

    // 3. Safely package the raw binary image stream directly into a Base64 string
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const finalPhotoUrl = `data:image/jpeg;base64,${base64Image}`;
    
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
