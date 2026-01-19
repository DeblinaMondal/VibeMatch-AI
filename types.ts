export interface SongRecommendation {
  artist: string;
  title: string;
  album?: string;
  reason: string;
  mood: string;
  genre: string;
  // Enriched data from Music Service
  previewUrl?: string;
  coverArtUrl?: string;
  externalUrl?: string;
}

export interface AnalysisState {
  status: 'idle' | 'staging' | 'analyzing' | 'success' | 'error';
  error?: string;
  data?: SongRecommendation[];
  imagePreviews?: string[];
  files?: File[];
}
