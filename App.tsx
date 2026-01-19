import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SongCard from './components/SongCard';
import { AnalysisState } from './types';
import { analyzeImageAndSuggestSong } from './services/geminiService';
import { enrichSongWithMetadata } from './services/musicService';
import { Disc, AlertCircle, Loader2, Sparkles, Image as ImageIcon, Upload, Plus, X, Play, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    data: [],
    files: [],
    imagePreviews: [],
  });

  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  
  // Ref to track the current analysis request ID to handle cancellation
  const analysisRequestId = useRef(0);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up logic if needed
    };
  }, []);

  const handleFileSelect = (newFiles: File[]) => {
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setState(prev => ({
      ...prev,
      status: 'staging',
      files: [...(prev.files || []), ...newFiles],
      imagePreviews: [...(prev.imagePreviews || []), ...newPreviews],
    }));
  };

  const removeFile = (index: number) => {
    setState(prev => {
      const newFiles = [...(prev.files || [])];
      const newPreviews = [...(prev.imagePreviews || [])];
      
      // Revoke the URL being removed
      if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
      
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);

      return {
        ...prev,
        files: newFiles,
        imagePreviews: newPreviews,
        status: newFiles.length === 0 ? 'idle' : 'staging'
      };
    });
  };

  const triggerAnalysis = async (isMore: boolean = false) => {
    const currentFiles = state.files;
    if (!currentFiles || currentFiles.length === 0) return;

    // Increment request ID
    const currentId = ++analysisRequestId.current;

    if (!isMore) {
       setState(prev => ({ ...prev, status: 'analyzing', data: [] }));
    } else {
      setIsGeneratingMore(true);
    }

    try {
      const excludeSongs = isMore && state.data 
        ? state.data.map(s => `${s.title} by ${s.artist}`) 
        : [];

      // 1. Get recommendations
      const rawRecommendations = await analyzeImageAndSuggestSong(currentFiles, excludeSongs);
      
      if (currentId !== analysisRequestId.current) return; // Cancelled

      // 2. Enrich
      const enrichedRecommendations = await Promise.all(
        rawRecommendations.map(song => enrichSongWithMetadata(song))
      );
      
      if (currentId !== analysisRequestId.current) return; // Cancelled

      setState(prev => ({
        ...prev,
        status: 'success',
        data: isMore ? [...(prev.data || []), ...enrichedRecommendations] : enrichedRecommendations,
      }));
    } catch (error) {
      console.error(error);
      if (currentId !== analysisRequestId.current) return; // Cancelled

      if (!isMore) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : "Something went wrong.",
        }));
      } else {
         alert("Failed to generate more songs.");
      }
    } finally {
      if (currentId === analysisRequestId.current) {
         setIsGeneratingMore(false);
      }
    }
  };

  const cancelAnalysis = () => {
    // Invalidate current request
    analysisRequestId.current++;
    setState(prev => ({ ...prev, status: 'staging' }));
  };

  const reset = () => {
    state.imagePreviews?.forEach(url => URL.revokeObjectURL(url));
    setState({ status: 'idle', data: [], files: [], imagePreviews: [] });
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 selection:bg-indigo-500/30 font-sans">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto relative z-10 mt-8 mb-12">
          
          {/* Idle State */}
          {state.status === 'idle' && (
             <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500 mt-10">
               <div className="mb-10 text-center space-y-3">
                 <h2 className="text-2xl font-semibold text-slate-200">Find the soundtrack to your life</h2>
                 <p className="text-slate-400">Upload photos to discover songs that match their collective vibe.</p>
               </div>
               <FileUpload onFileSelect={handleFileSelect} />
             </div>
          )}

          {/* Staging State (Review Images) */}
          {state.status === 'staging' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
               <div className="flex flex-col items-center mb-8 text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Your Collection</h2>
                  <p className="text-slate-400">Add more images or find songs for this collection.</p>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {state.imagePreviews?.map((preview, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl">
                       <img src={preview} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                       <button 
                         onClick={() => removeFile(index)}
                         className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500 text-white rounded-full transition-all shadow-lg backdrop-blur-sm z-10"
                         title="Remove image"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
                  <div className="aspect-square">
                    <FileUpload onFileSelect={handleFileSelect} compact />
                  </div>
               </div>

               <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => triggerAnalysis(false)}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                  >
                    <Sparkles className="w-5 h-5" />
                    Find Songs
                  </button>
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-all"
                  >
                    Clear All
                  </button>
               </div>
            </div>
          )}

          {/* Analyzing State */}
          {state.status === 'analyzing' && (
            <div className="w-full flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-500 py-12 mt-10">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.2)] border-8 border-slate-800/50">
                 {/* Show mosaic of previews in background */}
                 <div className="absolute inset-0 grid grid-cols-2 opacity-30 animate-pulse scale-110">
                    {state.imagePreviews?.slice(0, 4).map((src, i) => (
                       <img key={i} src={src} className="w-full h-full object-cover" />
                    ))}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                      <Disc className="relative w-20 h-20 text-indigo-400 animate-spin-slow" />
                    </div>
                 </div>
              </div>
              <div className="text-center space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                    Analyzing Collection...
                  </h3>
                  <p className="text-slate-400 text-lg">Identifying common themes, mood, and aesthetics.</p>
                </div>
                
                <button 
                  onClick={cancelAnalysis}
                  className="px-6 py-2 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {state.status === 'success' && state.data && (
            <div className="w-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Header with Source Images Strip */}
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                     <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                       <Sparkles className="w-6 h-6 text-yellow-400" />
                       Vibe Matched
                     </h2>
                     <p className="text-slate-400">
                       Based on your {state.files?.length} photos, here are the songs that fit the mood.
                     </p>
                   </div>
                   
                   {/* Mini strip of images */}
                   <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                      {state.imagePreviews?.map((src, i) => (
                        <div key={i} className="w-12 h-12 rounded-full ring-2 ring-slate-800 overflow-hidden relative shadow-lg bg-slate-800 shrink-0">
                          <img src={src} className="w-full h-full object-cover" alt="source" />
                        </div>
                      ))}
                   </div>
                </div>

                <div className="h-px bg-white/5 my-6"></div>

                <div className="flex gap-4">
                   <button 
                      onClick={() => triggerAnalysis(true)}
                      disabled={isGeneratingMore}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium transition-all text-sm active:scale-95"
                    >
                      {isGeneratingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {isGeneratingMore ? 'Curating...' : 'Generate More'}
                    </button>
                    
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-slate-600 text-sm active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      Start Over
                    </button>
                </div>
              </div>

              {/* Cards List - Standalone cards */}
              <div className="flex flex-col gap-4">
                {state.data.map((song, index) => (
                  <SongCard 
                    key={`${song.title}-${index}`} 
                    song={song} 
                    rank={index + 1}
                  />
                ))}
                
                 {/* Loading Skeletons - Updated for no image box */}
                 {isGeneratingMore && (
                   <>
                     {[1, 2].map(i => (
                       <div key={i} className="p-6 gap-4 flex flex-col animate-pulse rounded-2xl border border-white/5 bg-white/5">
                         <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                               <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                               <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                               <div className="flex gap-2">
                                  <div className="h-5 w-16 bg-slate-800 rounded"></div>
                                  <div className="h-5 w-16 bg-slate-800 rounded"></div>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <div className="w-20 h-8 bg-slate-800 rounded-xl"></div>
                               <div className="w-20 h-8 bg-slate-800 rounded-xl"></div>
                            </div>
                         </div>
                         <div className="mt-4 h-12 bg-slate-800 rounded w-full"></div>
                       </div>
                     ))}
                   </>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {state.status === 'error' && (
            <div className="w-full max-w-md mx-auto p-8 glass-panel rounded-3xl text-center space-y-6 animate-in fade-in zoom-in duration-300 mt-10">
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                 <AlertCircle className="w-8 h-8 text-red-500" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold text-white">Oops! Off Key.</h3>
                 <p className="text-slate-400">{state.error}</p>
               </div>
               <div className="flex gap-3">
                 <button 
                  onClick={() => triggerAnalysis(false)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  Retry
                </button>
                 <button 
                  onClick={reset}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700"
                >
                  Start Over
                </button>
               </div>
            </div>
          )}
        </main>

        <footer className="text-center text-slate-600 text-sm py-4">
          <p>Powered by Gemini 3 Flash & React</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
