
import React, { useState } from 'react';
import { MOCK_RECIPES } from './constants';
import RecipeCard from './components/RecipeCard';
import ImageEditor from './components/ImageEditor';
import LiveVoiceAssistant from './components/LiveVoiceAssistant';
import RecipeVideoGenerator from './components/RecipeVideoGenerator';
import { Recipe } from './types';

type Tab = 'home' | 'editor' | 'voice';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);

  const handleCloseModal = () => {
    setSelectedRecipe(null);
    setShowVideoGenerator(false);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <i className="fa-solid fa-utensils text-white"></i>
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Tasty <span className="text-orange-500">Food</span></h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-bold text-stone-600">
            <button 
              onClick={() => setActiveTab('home')}
              className={`${activeTab === 'home' ? 'text-orange-500' : 'hover:text-stone-900'} transition-colors`}
            >
              Recipes
            </button>
            <button 
              onClick={() => setActiveTab('editor')}
              className={`${activeTab === 'editor' ? 'text-orange-500' : 'hover:text-stone-900'} transition-colors`}
            >
              Photo Studio
            </button>
            <button 
              onClick={() => setActiveTab('voice')}
              className={`${activeTab === 'voice' ? 'text-orange-500' : 'hover:text-stone-900'} transition-colors`}
            >
              AI Assistant
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
              <i className="fa-solid fa-user text-stone-600 text-sm"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        {activeTab === 'home' && (
          <div className="space-y-12">
            <section className="recipe-gradient rounded-[3rem] p-12 text-stone-900 relative overflow-hidden shadow-2xl shadow-orange-100">
              <div className="relative z-10 max-w-xl space-y-6">
                <span className="bg-white/40 backdrop-blur px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                  Featured This Week
                </span>
                <h2 className="text-5xl font-black leading-tight">Master the Art of Modern Cuisine</h2>
                <p className="text-lg opacity-80 leading-relaxed">Discover secret recipes handed down through generations, now supercharged with AI precision.</p>
                <div className="flex gap-4">
                  <button className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200">
                    Explore All Recipes
                  </button>
                </div>
              </div>
              <img 
                src="https://picsum.photos/seed/culinary/600/600" 
                className="absolute top-0 right-0 h-full w-1/2 object-cover hidden lg:block mask-gradient"
                alt="Banner" 
              />
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold">Trending Now</h3>
                <button className="text-orange-500 font-bold hover:underline flex items-center gap-2">
                  View All <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_RECIPES.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'editor' && <ImageEditor />}
        {activeTab === 'voice' && <LiveVoiceAssistant />}

        {/* Recipe Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-fade-in">
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img src={selectedRecipe.imageUrl} className="w-full h-full object-cover" alt={selectedRecipe.title} />
                <button 
                  onClick={() => setShowVideoGenerator(true)}
                  className="absolute bottom-6 left-6 bg-stone-900/80 backdrop-blur text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-500 transition-all"
                >
                  <i className="fa-solid fa-play"></i> Watch AI Guide
                </button>
              </div>
              <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-stone-50">
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={handleCloseModal}
                    className="flex items-center gap-2 text-stone-500 hover:text-orange-500 font-bold transition-colors group"
                  >
                    <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                    Back to Recipes
                  </button>
                  <button 
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-stone-100 transition-colors md:hidden"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-4xl font-black mb-2">{selectedRecipe.title}</h2>
                  <div className="flex gap-4 text-sm font-bold text-stone-500">
                    <span>{selectedRecipe.time}</span>
                    <span>•</span>
                    <span>{selectedRecipe.difficulty}</span>
                  </div>
                </div>

                {showVideoGenerator ? (
                  <RecipeVideoGenerator 
                    recipe={selectedRecipe} 
                    onClose={() => setShowVideoGenerator(false)} 
                  />
                ) : (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h4 className="font-black text-orange-600 uppercase tracking-widest text-xs mb-4">Ingredients</h4>
                      <ul className="grid grid-cols-2 gap-3 text-stone-700 font-medium">
                        {selectedRecipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-300"></div> {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-black text-orange-600 uppercase tracking-widest text-xs mb-4">Instructions</h4>
                      <div className="space-y-6">
                        {selectedRecipe.instructions.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="text-2xl font-black text-orange-200 leading-none">0{i+1}</span>
                            <p className="text-stone-700 leading-relaxed font-medium">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-12 flex gap-4">
                      <button 
                        onClick={() => { setActiveTab('voice'); handleCloseModal(); }}
                        className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-microphone"></i> Start Voice Cooking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Mobile Bottom Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-stone-900 text-white rounded-[2rem] p-2 flex items-center justify-around shadow-2xl z-[60] md:hidden">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white' : 'text-stone-400'}`}
        >
          <i className="fa-solid fa-house"></i>
        </button>
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeTab === 'editor' ? 'bg-orange-500 text-white' : 'text-stone-400'}`}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </button>
        <button 
          onClick={() => setActiveTab('voice')}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeTab === 'voice' ? 'bg-orange-500 text-white' : 'text-stone-400'}`}
        >
          <i className="fa-solid fa-microphone"></i>
        </button>
      </nav>
    </div>
  );
};

export default App;
