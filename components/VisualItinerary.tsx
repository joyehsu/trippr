import React, { useState, useRef, useEffect } from 'react';
import { TripItinerary } from '../types';
import ActivityCard from './ActivityCard';
import TransportCard from './TransportCard';
import TripMap from './TripMap';

interface VisualItineraryProps {
  data: TripItinerary;
}

const VisualItinerary: React.FC<VisualItineraryProps> = ({ data }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeDay = data.days[activeDayIndex];

  // Auto-scroll the active tab into view when activeDayIndex changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeTab = container.children[activeDayIndex] as HTMLElement;

      if (activeTab) {
        // Calculate the scroll position to center the active tab
        // We use scrollTo instead of scrollIntoView to prevent the whole page from potentially shifting vertically
        const containerWidth = container.clientWidth;
        const tabWidth = activeTab.offsetWidth;
        const tabLeft = activeTab.offsetLeft;
        
        const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);

        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeDayIndex]);

  return (
    <div className="space-y-8" id="visual-itinerary">
      {/* Trip Header & Overview */}
      <div className="text-center pt-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{data.title}</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed mb-8">{data.summary}</p>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-4xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
          
          {/* Pace & Strategy */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">旅行節奏</h4>
              <p className="font-medium text-slate-700">{data.pace || '標準'}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">交通策略</h4>
              <p className="font-medium text-slate-700">{data.transportStrategy || '混合大眾運輸'}</p>
            </div>
          </div>

          {/* Budget */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">預算概算</h4>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-emerald-600">{data.budgetEstimate?.total || '未估算'}</span>
              <span className="text-xs text-slate-500">總計</span>
            </div>
            {data.budgetEstimate?.breakdown && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                <div className="flex justify-between"><span>交通:</span> <span>{data.budgetEstimate.breakdown.transport}</span></div>
                <div className="flex justify-between"><span>餐飲:</span> <span>{data.budgetEstimate.breakdown.dining}</span></div>
                <div className="flex justify-between"><span>門票:</span> <span>{data.budgetEstimate.breakdown.tickets}</span></div>
                <div className="flex justify-between"><span>其他:</span> <span>{data.budgetEstimate.breakdown.other}</span></div>
              </div>
            )}
          </div>

          {/* Risks */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">風險與注意</h4>
            {data.riskManagement && data.riskManagement.length > 0 ? (
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                {data.riskManagement.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-red-600">請注意天氣與交通狀況。</p>
            )}
          </div>
        </div>
        
        {/* Map Visualization */}
        <div className="max-w-4xl mx-auto mb-8 animate-fade-in">
           <TripMap itinerary={data} activeDay={activeDayIndex} />
        </div>
      </div>

      {/* Day Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-white pt-2 pb-4 border-b border-slate-100 shadow-sm">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 px-4 pb-2 w-full snap-x scroll-smooth relative"
          style={{ scrollbarWidth: 'thin' }}
        >
          {data.days.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex-shrink-0 snap-center px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${
                idx === activeDayIndex
                  ? 'bg-slate-800 text-white border-slate-800 shadow-lg scale-100'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              第 {day.dayNumber} 天
              {day.date && <span className="ml-1 font-normal opacity-75">| {day.date}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Active Day Content */}
      <div className="animate-fade-in px-1 min-h-[500px]">
         <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-blue-600">第 {activeDay.dayNumber} 天</span>
              <span className="text-slate-300">/</span>
              <span>{activeDay.theme || '本日行程'}</span>
            </h3>
            {activeDay.dailyBudgetEstimate && (
               <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-100">
                 本日預算: {activeDay.dailyBudgetEstimate}
               </span>
            )}
         </div>

         <div className="ml-2 sm:ml-4 border-l-2 border-slate-100 pl-4 pb-8 space-y-2">
            {activeDay.activities.map((activity, idx) => (
              <React.Fragment key={activity.id || idx}>
                <ActivityCard activity={activity} index={idx} />
                {activity.transportToNext && (
                   <TransportCard transport={activity.transportToNext} />
                )}
              </React.Fragment>
            ))}
            
            {activeDay.activities.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                本日尚無詳細活動安排
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default VisualItinerary;