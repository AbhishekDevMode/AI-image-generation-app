const User = require('../models/User');

const generateImage = async (req, res) => {
  // 1. Unblock CORS for your frontend application
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
    
    // Set up standard production image aspect ratios for Imagen 3
    let aspectValue = "1:1";
    if (aspectRatio === '16:9') aspectValue = "16:9";
    if (aspectRatio === '4:3') aspectValue = "4:3";
    
    // 2. Fetch directly from Google's official Imagen 3 generation model
    // REPLACE YOUR_GEMINI_API_KEY_HERE with your key from Google AI Studio
    const geminiKey = process.env.GEMINI_API_KEY || "AIzaSyD1dpSdte7g6KcvNer9xEqKQSh4PmKd11c";
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          numberOfImages: 1,
          aspectRatio: aspectValue,
          outputMimeType: "image/jpeg"
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini Engine Error: ${response.status} - ${errorText}`);
      return res.status(500).json({ message: 'AI generation engine is busy. Please try again.' });
    }

    const data = await response.json();
    
    // 3. Extract the clean Base64 image chunk directly provided by Google
    const rawBase64 = data.generatedImages[0].image.imageBytes;
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
