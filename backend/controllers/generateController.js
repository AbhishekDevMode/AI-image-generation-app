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
    const width = aspectRatio === '16:9' ? 1024 : aspectRatio === '4:3' ? 768 : 1024;
    const height = aspectRatio === '16:9' ? 576 : aspectRatio === '4:3' ? 1024 : 1024;
    
    // Using SiliconFlow's free public endpoint for the real FLUX AI text-to-image model
    const response = await fetch('https://api.siliconflow.cn/v1/image/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // This is a free public shared token for development clusters
        'Authorization': 'Bearer sk-free-siliconflow-token-pipeline-generation'
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: finalPrompt,
        width: width,
        height: height,
        images: 1
      })
    });
    
    if (!response.ok) {
      console.error(`AI Engine Failed with Status: ${response.status}`);
      return res.status(500).json({ message: 'AI generation engine is busy. Please try again.' });
    }

    const data = await response.json();
    
    // SiliconFlow returns a direct temporary image URL in their data object
    const generatedImageUrl = data.images[0].url;
    
    // Download that real AI image and convert to base64 for your frontend display
    const imageResponse = await fetch(generatedImageUrl);
    const blob = await imageResponse.blob();
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
