import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import ImageCard from '../components/ImageCard';
import { Loader2, User, Coins, Heart, Image as ImageIcon } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'creations'
  const [favorites, setFavorites] = useState([]);
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch user profile to get populated favorites
        const { data: profileData } = await axios.get('/users/profile');
        setFavorites(profileData.favorites);

        // Fetch user's own creations
        const { data: postsData } = await axios.get('/posts');
        const myCreations = postsData.filter(post => post.user._id === user._id);
        setCreations(myCreations);
      } catch (error) {
        console.error('Error fetching profile data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const displayedPosts = activeTab === 'favorites' ? favorites : creations;

  return (
    <div className="py-8 max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="glass-panel p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold border-4 border-surface shadow-2xl relative z-10">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        
        <div className="flex-1 text-center md:text-left relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
          <p className="text-gray-400 mb-6">{user?.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 font-medium">Available Credits</p>
                <p className="text-lg font-bold text-white">{user?.credits}</p>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
              <div className="bg-secondary/20 p-2 rounded-lg">
                <ImageIcon className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 font-medium">Total Creations</p>
                <p className="text-lg font-bold text-white">{creations.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center md:justify-start gap-4 mb-8 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 px-4 font-medium transition-all relative ${
            activeTab === 'favorites' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" /> My Favorites
          </div>
          {activeTab === 'favorites' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('creations')}
          className={`pb-3 px-4 font-medium transition-all relative ${
            activeTab === 'creations' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> My Creations
          </div>
          {activeTab === 'creations' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Grid Area */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : displayedPosts.length > 0 ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {displayedPosts.map((post) => (
            <ImageCard key={post._id} {...post} />
          ))}
        </Masonry>
      ) : (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            {activeTab === 'favorites' ? (
              <Heart className="w-6 h-6 text-gray-500" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {activeTab === 'favorites' ? 'No favorites yet' : 'No creations yet'}
          </h3>
          <p className="text-gray-400">
            {activeTab === 'favorites' 
              ? 'Start exploring the community showcase and heart your favorite images.' 
              : 'Head over to the Create workspace to generate your first masterpiece.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
