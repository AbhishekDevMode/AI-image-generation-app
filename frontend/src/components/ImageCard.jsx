import React, { useState, useContext } from 'react';
import { Download, Copy, Heart } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ImageCard = ({ _id, user, prompt, imageUrl, likesCount, stylePreset }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [likes, setLikes] = useState(likesCount);
  const [isLiked, setIsLiked] = useState(currentUser?.favorites?.includes(_id) || false);
  const [isLiking, setIsLiking] = useState(false);

  const downloadImage = async (url, _id) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `nexusai-gen-${_id}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image', error);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    // Could add a toast notification here
  };

  const handleLike = async () => {
    if (!currentUser || isLiking) return;
    
    setIsLiking(true);
    try {
      const { data } = await axios.put(`/posts/${_id}/like`);
      setLikes(data.likesCount);
      setIsLiked(data.isLiked);
    } catch (error) {
      console.error('Error toggling like', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden glass-panel mb-4 hover:shadow-primary/20 hover:shadow-2xl transition-all duration-300">
      <img
        src={imageUrl}
        alt={prompt}
        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      
      {stylePreset && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
          {stylePreset}
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
        <p className="text-white text-sm font-medium line-clamp-3 mb-4 leading-relaxed">
          {prompt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className={`p-2 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 ${isLiked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-semibold">{likes}</span>
            </button>
            
            <button 
              onClick={copyPrompt}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10 transition-all"
              title="Copy Prompt"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => downloadImage(imageUrl, _id)}
            className="p-2 rounded-full bg-primary/80 backdrop-blur-md text-white hover:bg-primary border border-white/10 transition-all flex items-center justify-center"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* User Info (always visible on bottom bar if needed, or in overlay. We'll put it outside the hover area) */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <span className="text-xs font-medium truncate max-w-[100px]">{user?.name}</span>
      </div>
    </div>
  );
};

export default ImageCard;
