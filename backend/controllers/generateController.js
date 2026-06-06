const User = require('../models/User');

const generateImage = async (req, res) => {
  // 1. Explicitly enable CORS for your frontend application
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

    // Pulls your secret token securely out of Vercel's private settings
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      console.error("Missing HF_TOKEN environment variable in Vercel settings.");
      return res.status(500).json({ message: 'Server configuration error. Missing API Token.' });
    }

    // 2. Official Hugging Face Production Pipeline (Stable Diffusion XL)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: finalPrompt,
          options: { wait_for_model: true }
        }),
      }
    );
    
    if (!response.ok) {
      const errLog = await response.text();
      console.error(`Hugging Face Error: ${response.status} - ${errLog}`);
      return res.status(500).json({ message: 'AI Engine is waking up. Please click Generate again in 10 seconds!' });
    }

    // 3. Convert the generated raw binary stream safely into a Base64 string
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
