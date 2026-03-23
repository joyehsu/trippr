import React, { useState, useEffect } from 'react';
import { parseItinerary } from './services/gemini';
import { TripItinerary, ViewMode } from './types';
import VisualItinerary from './components/VisualItinerary';
import { generateMarkdown } from './utils/markdownGenerator';
import { exportToHtml } from './utils/htmlExporter';
import ApiKeyModal from './components/ApiKeyModal';

const EXAMPLE_ITINERARY = `
日本東京五天四夜行程

Day 1: 抵達東京
- 上午 10:00 抵達成田機場，搭乘 Skyliner 到上野。
- 中午在上野恩賜公園野餐，參觀上野動物園。
- 下午 3 點 check-in 上野站前的 APA 飯店。
- 晚上去阿美橫町吃海鮮丼，逛藥妝店。

Day 2: 淺草與晴空塔
- 早上 9 點穿著和服參拜淺草寺雷門。
- 中午在淺草今半吃壽喜燒。
- 下午搭地鐵去晴空塔，逛 Solamachi 購物中心。
- 晚上在晴空塔頂樓看夜景。

Day 3: 迪士尼樂園
- 全天在東京迪士尼樂園遊玩。
- 晚上看煙火秀。
`;

function App() {
  const [inputText, setInputText] = useState('');
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.VISUAL);
  const [userApiKey, setUserApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('trippr_gemini_api_key');
    if (savedKey) {
      setUserApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem('trippr_gemini_api_key', key);
    } else {
      localStorage.removeItem('trippr_gemini_api_key');
    }
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    
    if (!userApiKey && !process.env.API_KEY) {
      setIsApiKeyModalOpen(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setItinerary(null);
    
    try {
      const result = await parseItinerary(inputText, userApiKey);
      setItinerary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const handleUseExample = () => {
    setInputText(EXAMPLE_ITINERARY.trim());
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已複製到剪貼簿！');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <h1 className="font-bold text-xl text-slate-800">Trippr <span className="text-slate-400 font-normal text-sm ml-1 hidden sm:inline">智能行程助手</span></h1>
          </div>
          <div className="flex gap-4 items-center">
             <button
               onClick={() => setIsApiKeyModalOpen(true)}
               className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
               title="設定自訂 API Key"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               {userApiKey ? '已設定 API Key' : '設定 API Key'}
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        {!itinerary && !loading && (
          <div className="max-w-2xl mx-auto mt-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">貼上您的行程草稿</h2>
            <p className="text-center text-slate-500 mb-8">
              將任何形式的旅遊文字（PDF 內容、聊天記錄、筆記）貼在下方，AI 將為您整理成互動式地圖行程。
            </p>
            
            <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200">
              <textarea
                className="w-full h-64 p-4 text-slate-700 bg-transparent resize-none focus:outline-none text-base"
                placeholder="在此貼上行程..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-between items-center px-4 py-2 border-t border-slate-100 bg-slate-50 rounded-b-lg">
                <button 
                  onClick={handleUseExample}
                  className="text-sm text-slate-500 hover:text-blue-600 underline"
                >
                  試用範例
                </button>
                <button
                  onClick={handleParse}
                  disabled={!inputText.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  開始規劃
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-medium text-slate-800">正在整理您的行程...</h3>
            <p className="text-slate-500 mt-2">正在分析地點、查詢交通與建立地圖連結</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
            <p className="font-bold mb-2">出錯了</p>
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-4 text-sm underline hover:text-red-800"
            >
              重試
            </button>
          </div>
        )}

        {itinerary && !loading && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <button 
                onClick={() => setItinerary(null)}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium self-start sm:self-auto"
              >
                ← 返回輸入
              </button>
              
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                   onClick={() => exportToHtml(itinerary)}
                   className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors mr-2 border border-indigo-100"
                   title="下載離線網頁"
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                   匯出離線行程
                </button>

                 <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setViewMode(ViewMode.VISUAL)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.VISUAL ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    地圖行程
                  </button>
                  <button
                    onClick={() => setViewMode(ViewMode.MARKDOWN)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.MARKDOWN ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setViewMode(ViewMode.JSON)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.JSON ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    JSON 資料
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 min-h-[600px] p-6 sm:p-10">
              {viewMode === ViewMode.VISUAL && <VisualItinerary data={itinerary} />}
              
              {viewMode === ViewMode.MARKDOWN && (
                <div className="relative">
                   <div className="absolute right-0 top-0">
                      <button 
                        onClick={() => copyToClipboard(generateMarkdown(itinerary))}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded"
                      >
                        複製 Markdown
                      </button>
                   </div>
                   <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-6 rounded-lg overflow-x-auto">
                     {generateMarkdown(itinerary)}
                   </pre>
                </div>
              )}

              {viewMode === ViewMode.JSON && (
                <div className="relative">
                   <div className="absolute right-0 top-0">
                      <button 
                        onClick={() => copyToClipboard(JSON.stringify(itinerary, null, 2))}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded"
                      >
                        複製 JSON
                      </button>
                   </div>
                   <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 bg-slate-50 p-6 rounded-lg overflow-x-auto max-h-[800px]">
                     {JSON.stringify(itinerary, null, 2)}
                   </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Powered by Google Gemini 2.0 Pro</p>
        </div>
      </footer>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        initialKey={userApiKey}
      />
    </div>
  );
}

export default App;