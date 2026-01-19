import { SongRecommendation } from "../types";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const ITUNES_API = "https://itunes.apple.com/search";

interface ItunesResult {
  artworkUrl100: string;
  previewUrl: string;
  trackViewUrl: string;
  collectionName: string;
}

export const enrichSongWithMetadata = async (song: SongRecommendation): Promise<SongRecommendation> => {
  try {
    const query = encodeURIComponent(`${song.artist} ${song.title}`);
    const url = `${ITUNES_API}?term=${query}&media=music&entity=song&limit=1`;
    
    // Use CORS proxy to avoid browser restrictions
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    
    if (!response.ok) return song;

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result: ItunesResult = data.results[0];
      
      // Get higher resolution artwork (replace 100x100 with 600x600)
      const highResArt = result.artworkUrl100.replace('100x100bb', '600x600bb');

      return {
        ...song,
        previewUrl: result.previewUrl,
        coverArtUrl: highResArt,
        externalUrl: result.trackViewUrl,
        album: result.collectionName || song.album // Use iTunes album if available
      };
    }

    return song;
  } catch (error) {
    console.warn(`Failed to fetch metadata for ${song.title}:`, error);
    return song;
  }
};
