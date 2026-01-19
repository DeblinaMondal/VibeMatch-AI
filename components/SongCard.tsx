import React from 'react';
import { SongRecommendation } from '../types';

interface SongCardProps {
  song: SongRecommendation;
  rank: number;
}

const SpotifyLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const YoutubeMusicLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
  </svg>
);

const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const searchQuery = encodeURIComponent(`${song.artist} ${song.title}`);
  const spotifySearch = `https://open.spotify.com/search/${searchQuery}`;
  const youtubeSearch = `https://music.youtube.com/search?q=${searchQuery}`;

  return (
    <div className="relative flex flex-col p-6 gap-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group">
      
      {/* Header Section: Title, Artist, Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
         <div className="min-w-0 flex-1">
           <h3 className="text-xl font-bold text-white leading-tight mb-1">{song.title}</h3>
           <p className="text-indigo-300 font-medium text-base mb-3">{song.artist}</p>
           
           <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-md text-[10px] bg-slate-800 text-slate-300 uppercase font-bold tracking-wider border border-white/10">
                {song.genre}
              </span>
              <span className="px-2 py-1 rounded-md text-[10px] bg-indigo-500/10 text-indigo-300 uppercase font-bold tracking-wider border border-indigo-500/20">
                {song.mood}
              </span>
           </div>
         </div>

         {/* Actions */}
         <div className="flex gap-2 shrink-0 md:self-start self-end mt-2 md:mt-0">
            <a 
              href={spotifySearch} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] transition-all hover:scale-105 border border-[#1DB954]/20"
              title="Open in Spotify"
            >
              <SpotifyLogo />
              <span className="text-xs font-bold hidden sm:inline">Spotify</span>
            </a>
            <a 
              href={youtubeSearch} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] transition-all hover:scale-105 border border-[#FF0000]/20"
              title="Open in YouTube Music"
            >
              <YoutubeMusicLogo />
              <span className="text-xs font-bold hidden sm:inline">YT Music</span>
            </a>
         </div>
      </div>
       
      {/* Full Text Description */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-slate-400 text-sm leading-relaxed italic">
           "{song.reason}"
        </p>
      </div>
    </div>
  );
};

export default SongCard;