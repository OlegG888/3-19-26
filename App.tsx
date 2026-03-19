import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { generateOrEditImage } from './services/geminiService';
import { Upload, Image as ImageIcon, X, Send, Download, Wand2, Camera, RefreshCw, Sparkles } from 'lucide-react';
import { GeneratedImage } from './types';

const SAMPLE_PROMPTS = [
  "Add a retro filter",
  "Remove the person in the background",
  "Change the sky to a starry night",
  "Make it look like a oil painting",
  "Логотип для агенції з автоматизації n8n 'Octopus'. Векторний, мінімалістичний."
];

export default function App() {
  // State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Reset previous generation when new file loaded
    setGeneratedImage(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSourceImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Detect mime type if source image exists
      let mimeType = 'image/png';
      if (sourceImage) {
        const match = sourceImage.match(/^data:(image\/[a-zA-Z]+);base64,/);
        if (match) {
          mimeType = match[1];
        }
      }

      const resultBase64 = await generateOrEditImage(prompt, sourceImage || undefined, mimeType);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        imageUrl: `data:image/png;base64,${resultBase64}`,
        prompt: prompt,
        sourceImageUrl: sourceImage || undefined,
        timestamp: Date.now()
      };

      setGeneratedImage(newImage);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating the image.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `nanoedit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        
        {/* LEFT PANEL - INPUTS */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-6">
          
          {/* Image Upload Section */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                Source Image
              </h2>
              {sourceImage && (
                <button 
                  onClick={handleRemoveImage}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="relative group">
              {sourceImage ? (
                <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-square flex items-center justify-center border border-gray-600">
                  <img 
                    src={sourceImage} 
                    alt="Source" 
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700/50 transition-all group"
                >
                  <div className="bg-gray-700 p-4 rounded-full group-hover:scale-110 transition-transform duration-300 mb-3">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-400" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP</p>
                  <p className="text-xs text-indigo-400 mt-4 bg-indigo-400/10 px-3 py-1 rounded-full">Optional for generation</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Prompt Section */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex-grow flex flex-col">
             <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Magic Prompt
              </h2>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={sourceImage ? "Describe how to edit the image (e.g., 'Add sunglasses')..." : "Describe the image you want to generate..."}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-32 transition-all"
              />

              {/* Sample Prompts Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.slice(0, 3).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors border border-gray-600 truncate max-w-full"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-[0.98] ${
                    loading || !prompt.trim() 
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25'
                  }`}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span className="animate-pulse">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      {sourceImage ? "Edit Image" : "Generate Image"}
                    </>
                  )}
                </button>
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* RIGHT PANEL - OUTPUT */}
        <div className="w-full lg:w-2/3 flex flex-col h-full min-h-[500px]">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl flex-grow overflow-hidden flex flex-col relative">
             <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 backdrop-blur-sm z-10">
                <h2 className="text-lg font-semibold text-white">Result</h2>
                {generatedImage && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerate}
                      className="p-2 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => downloadImage(generatedImage.imageUrl)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                )}
             </div>

             <div className="flex-grow bg-gray-900/50 relative flex items-center justify-center p-4">
                {generatedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Pattern Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>
                    
                    <img 
                      src={generatedImage.imageUrl} 
                      alt="Generated result" 
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-gray-700"
                    />
                  </div>
                ) : (
                  <div className="text-center max-w-md p-8">
                    <div className="bg-gray-800/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-700">
                      <Sparkles className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Ready to Create</h3>
                    <p className="text-gray-500">
                      Upload an image to edit, or just type a prompt to generate something new. 
                      Try "A futuristic city on Mars" or "Turn the photo into a sketch".
                    </p>
                  </div>
                )}
             </div>
             
             {/* Status Bar / Prompt Display */}
             {generatedImage && (
                <div className="p-4 bg-gray-900 border-t border-gray-700 text-sm text-gray-400 font-mono truncate">
                  <span className="text-indigo-400 font-bold mr-2">PROMPT &gt;</span>
                  {generatedImage.prompt}
                </div>
             )}
          </div>
        </div>

      </main>
    </div>
  );
}
