
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Recipe } from '../types';

interface RecipeVideoGeneratorProps {
  recipe: Recipe;
  onClose: () => void;
}

const LOADING_MESSAGES = [
  "Tasty AI is gathering the freshest digital ingredients...",
  "Heating up the virtual stove...",
  "Simmering the prompt for maximum flavor...",
  "Plating the cinematic shots...",
  "Almost ready! Adding a garnish of pixels...",
  "Just a few more seconds, checking the seasoning..."
];

const RecipeVideoGenerator: React.FC<RecipeVideoGeneratorProps> = ({ recipe, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: number;
    if (loading) {
      let i = 0;
      interval = window.setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setProgressMessage(LOADING_MESSAGES[i]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerateVideo = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      // 1. API Key Selection Check (Mandatory for Veo)
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      // 2. Initialize Gemini with current key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      // 3. Trigger Generation
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A cinematic, high-quality cooking tutorial video for ${recipe.title}. 
                Show the preparation of ${recipe.description}. 
                The video should look appetizing, professional, and focus on the culinary techniques.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // 4. Polling for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (pollError: any) {
          if (pollError.message?.includes("Requested entity was not found")) {
            await window.aistudio.openSelectKey();
            throw new Error("API Key session expired. Please select your key again.");
          }
          throw pollError;
        }
      }

      // 5. Fetch and set video URL
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
        setVideoUrl(finalUrl);
      } else {
        throw new Error("Video generation failed to return a link.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during video generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-900 text-white rounded-[2rem] p-8 shadow-2xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-clapperboard text-orange-500"></i>
          AI Video Guide
        </h3>
        <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div className="aspect-video bg-stone-800 rounded-2xl overflow-hidden flex items-center justify-center relative border border-stone-700">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          />
        ) : loading ? (
          <div className="text-center p-8 space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <i className="fa-solid fa-fire-burner absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-orange-500"></i>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold animate-pulse text-orange-100">{progressMessage}</p>
              <p className="text-sm text-stone-400">This usually takes about 1-2 minutes. Please don't close this window.</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 space-y-4">
            <i className="fa-solid fa-circle-exclamation text-4xl text-red-500"></i>
            <p className="text-red-400 font-medium">{error}</p>
            <button 
              onClick={handleGenerateVideo}
              className="px-6 py-2 bg-stone-700 hover:bg-stone-600 rounded-full text-sm font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="text-center p-8 space-y-6">
            <div className="w-20 h-20 bg-stone-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <i className="fa-solid fa-film text-3xl text-stone-500"></i>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-stone-300">Generate a custom cinematic guide for {recipe.title}</p>
              <button 
                onClick={handleGenerateVideo}
                className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-orange-900/40 flex items-center gap-3 mx-auto"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Create AI Video
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-stone-500 bg-stone-800/50 p-4 rounded-xl flex items-start gap-3">
        <i className="fa-solid fa-circle-info mt-0.5"></i>
        <p>
          Video generation requires a paid API key. 
          If you don't have one, you can set it up in the 
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline mx-1">
            Google AI Studio Billing
          </a> 
          documentation.
        </p>
      </div>
    </div>
  );
};

export default RecipeVideoGenerator;
