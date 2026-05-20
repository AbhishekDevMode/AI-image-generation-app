import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Wand2, Download, Image as ImageIcon, Loader2, Sparkles, Share2 } from 'lucide-react';
import axios from 'axios';

const PREDEFINED_PROMPTS = [
  "A futuristic neon cyberpunk street in Tokyo, rainy night, 8k resolution",
  "A cute corgi wearing a space suit on the moon, highly detailed, digital art",
  "An ancient overgrown temple in a lush jungle, cinematic lighting, photorealistic",
  "A floating island with waterfalls in the sky, fantasy landscape, unreal engine 5",
  "A portrait of a beautiful woman with glowing neon tattoos, cyberpunk aesthetic"
];

const STYLE_PRESETS = [
  { id: '', label: 'None' },
  { id: 'Anime / Manga style, highly detailed', label: 'Anime / Manga' },
  { id: '3D Render, Unreal Engine 5, Octane Render', label: '3D Render / UE5' },
  { id: 'Oil Painting, Van Gogh Style, impasto', label: 'Oil Painting' },
  { id: 'Vaporwave, retro 80s aesthetic, neon colors', label: 'Vaporwave' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1)' },
  { id: '16:9', label: 'Landscape (16:9)' },
  { id: '4:3', label: 'Portrait (4:3)' }
];

const CreatePost = () => {
  const { user, updateCredits } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    prompt: '',
    stylePreset: '',
    aspectRatio: '1:1'
  });
  
  const [photo, setPhoto] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * PREDEFINED_PROMPTS.length);
    const randomPrompt = PREDEFINED_PROMPTS[randomIndex];
    setForm({ ...form, prompt: randomPrompt });
  };

  const generateImage = async () => {
    if (!form.prompt) {
      setError('Please enter a prompt first.');
      return;
    }
    
    if (user.credits <= 0) {
      setError('You have run out of credits. Please try again tomorrow.');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setPhoto(null);

      const { data } = await axios.post('/generate', {
        prompt: form.prompt,
        aspectRatio: form.aspectRatio,
        stylePreset: form.stylePreset
      });

      setPhoto(data.photo);
      updateCredits(data.credits);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const shareWithCommunity = async () => {
    if (!form.prompt || !photo) {
      setError('Please generate an image first.');
      return;
    }

    try {
      setSharing(true);
      setError('');
      
   
      const styleLabel = STYLE_PRESETS.find(s => s.id === form.stylePreset)?.label || 'None';

      await axios.post('/posts', {
        prompt: form.prompt,
        photo: photo,
        stylePreset: styleLabel !== 'None' ? styleLabel : '',
        aspectRatio: form.aspectRatio
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share image.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white">
          Create <span className="text-primary">Magic</span>
        </h1>
        <p className="text-gray-400">Describe what you want to see, and AI will generate it for you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
     
        <div className="space-y-8 glass-panel p-6 sm:p-8">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

        
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" /> Your Prompt
              </label>
              <button 
                type="button" 
                onClick={handleSurpriseMe}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1.5 text-gray-300"
              >
                <Sparkles className="w-3 h-3 text-secondary" /> Surprise Me
              </button>
            </div>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32"
              placeholder="A highly detailed majestic lion wearing a golden crown in a mystical forest..."
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Style Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-200 mb-2 block">Style Preset</label>
              <div className="relative">
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  value={form.stylePreset}
                  onChange={(e) => setForm({ ...form, stylePreset: e.target.value })}
                >
                  {STYLE_PRESETS.map((style) => (
                    <option key={style.label} value={style.id} className="bg-surface text-gray-300">
                      {style.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-200 mb-2 block">Aspect Ratio</label>
              <div className="relative">
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  value={form.aspectRatio}
                  onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })}
                >
                  {ASPECT_RATIOS.map((ratio) => (
                    <option key={ratio.id} value={ratio.id} className="bg-surface text-gray-300">
                      {ratio.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={generateImage}
              disabled={generating || !form.prompt}
              className={`w-full btn-primary h-14 text-lg flex items-center justify-center gap-2 ${(!form.prompt || generating) && 'opacity-50 cursor-not-allowed hover:scale-100 hover:opacity-50'}`}
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Generate Image (1 Credit)
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
              You have <span className="text-yellow-500 font-medium">{user.credits}</span> credits remaining today.
            </p>
          </div>
        </div>

        {/* Output Area */}
        <div className="glass-panel p-2 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
          {generating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
              <div className="w-20 h-20 relative mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-primary font-medium animate-pulse">Dreaming up your creation...</p>
              <p className="text-xs text-gray-400 mt-2">This may take 10-20 seconds</p>
            </div>
          ) : photo ? (
            <div className="w-full h-full relative group rounded-xl overflow-hidden">
              <img 
                src={photo} 
                alt="Generated AI Art" 
                className="w-full h-full object-contain bg-black/20"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-center gap-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button 
                  onClick={shareWithCommunity}
                  disabled={sharing}
                  className="btn-primary py-2 px-6 flex items-center gap-2 min-w-[200px] justify-center"
                >
                  {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  {sharing ? 'Sharing...' : 'Share with Community'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <ImageIcon className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-400 font-medium">Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
