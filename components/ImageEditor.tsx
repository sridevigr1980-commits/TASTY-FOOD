
import React, { useState, useRef } from 'react';
import { editFoodImage, blobToBase64 } from '../services/gemini';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setImage(`data:${file.type};base64,${base64}`);
      setResult(null);
      setError(null);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setEditing(true);
    setError(null);
    try {
      const mimeType = image.split(':')[1].split(';')[0];
      const base64Data = image.split(',')[1];
      const editedImageUrl = await editFoodImage(base64Data, prompt, mimeType);
      setResult(editedImageUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong while editing.");
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Food Photo Studio</h2>
        <p className="text-stone-600 italic">"Make your recipes look as good as they taste"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-stone-100 rounded-3xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors overflow-hidden relative"
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Upload" />
            ) : (
              <div className="text-center p-6">
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-stone-400 mb-4"></i>
                <p className="font-semibold text-stone-500">Click to upload your dish</p>
                <p className="text-sm text-stone-400">JPG, PNG supported</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Describe Changes</label>
            <div className="relative">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a warm vintage filter' or 'Make it look more spicy'"
                className="w-full pl-4 pr-24 py-4 rounded-2xl bg-white shadow-sm border border-stone-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
              <button 
                onClick={handleEdit}
                disabled={!image || !prompt || editing}
                className="absolute right-2 top-2 bottom-2 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 text-white rounded-xl font-bold transition-colors"
              >
                {editing ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Apply'}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>

        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-stone-100 shadow-inner flex flex-col items-center justify-center overflow-hidden relative">
            {result ? (
              <img src={result} className="w-full h-full object-cover animate-fade-in" alt="Result" />
            ) : editing ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-stone-500 animate-pulse font-medium">Tasty AI is polishing your photo...</p>
              </div>
            ) : (
              <div className="text-center p-6 text-stone-400">
                <i className="fa-solid fa-wand-magic-sparkles text-4xl mb-4"></i>
                <p>Your magic edit will appear here</p>
              </div>
            )}
          </div>
          {result && (
            <a 
              href={result} 
              download="tasty-food-masterpiece.png"
              className="block w-full text-center py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors"
            >
              Download Masterpiece
            </a>
          )}
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
        <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-lightbulb"></i> Pro Editing Tips
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-orange-700">
          <li className="flex items-center gap-2"><i className="fa-solid fa-check text-[10px]"></i> "Add steam rising from the bowl"</li>
          <li className="flex items-center gap-2"><i className="fa-solid fa-check text-[10px]"></i> "Make the greens look fresher and brighter"</li>
          <li className="flex items-center gap-2"><i className="fa-solid fa-check text-[10px]"></i> "Convert into a dark mood, fine-dining style"</li>
          <li className="flex items-center gap-2"><i className="fa-solid fa-check text-[10px]"></i> "Add a blurred rustic kitchen background"</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageEditor;
