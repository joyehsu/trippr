import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { TripItinerary } from '../types';
import ActivityCard from '../components/ActivityCard';
import TransportCard from '../components/TransportCard';

const OfflineItinerary = ({ data }: { data: TripItinerary }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 font-sans text-slate-900">
      {/* Header */}
      <div className="text-center pt-8 pb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">{data.title}</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed mb-8">{data.summary}</p>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
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

        {/* Map Container for Export */}
        <div className="mb-8 relative group">
           <div id="offline-map" className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 bg-slate-100"></div>
           
           {/* Map Controls */}
           <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
             <button
                id="map-toggle-btn"
                className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-md text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
             >
               顯示全程路線
             </button>
           </div>
           
           {/* Map Legend */}
           <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-md text-xs z-[500] border border-slate-100 max-w-[150px]">
              <h4 id="map-legend-title" className="font-bold mb-2 text-slate-700">第 1 天路線</h4>
              <div id="map-legend-content" className="space-y-1.5 max-h-[100px] overflow-y-auto">
                {/* Legend items will be injected by JS */}
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur pt-2 pb-4 border-b border-slate-100 shadow-sm mb-6">
        <div className="flex overflow-x-auto gap-3 px-2 pb-2 w-full snap-x scroll-smooth" id="tabs-container">
          {data.days.map((day, idx) => (
            <button
              key={idx}
              data-tab-target={idx}
              className={`tab-btn flex-shrink-0 snap-center px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${
                idx === 0
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

      {/* Days Content */}
      <div>
        {data.days.map((day, idx) => (
          <div 
            key={idx} 
            id={`day-${idx}`} 
            className={`day-content ${idx === 0 ? '' : 'hidden'} animate-fade-in`}
          >
             <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-600">第 {day.dayNumber} 天</span>
                  <span className="text-slate-300">/</span>
                  <span>{day.theme || '本日行程'}</span>
                </h3>
                {day.dailyBudgetEstimate && (
                   <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-100">
                     本日預算: {day.dailyBudgetEstimate}
                   </span>
                )}
             </div>

             <div className="ml-2 sm:ml-4 border-l-2 border-slate-100 pl-4 pb-8 space-y-2">
                {day.activities.map((activity, actIdx) => (
                  <React.Fragment key={activity.id || actIdx}>
                    <ActivityCard activity={activity} index={actIdx} />
                    {activity.transportToNext && (
                       <TransportCard transport={activity.transportToNext} />
                    )}
                  </React.Fragment>
                ))}
                 {day.activities.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    本日尚無詳細活動安排
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-sm">
         <p>行程由 Trippr 生成 | {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export const exportToHtml = (itinerary: TripItinerary) => {
  const htmlContent = ReactDOMServer.renderToStaticMarkup(<OfflineItinerary data={itinerary} />);
  const itineraryJson = JSON.stringify(itinerary);

  const fullHtml = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${itinerary.title} - Trippr 行程</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    body { font-family: 'Noto Sans TC', sans-serif; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  </style>
</head>
<body class="bg-slate-50 min-h-screen">
  ${htmlContent}
  <script>
    // Embedded Itinerary Data
    const itineraryData = ${itineraryJson};
    
    // Map Logic
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Initialize Tabs & View Switching
      const tabs = document.querySelectorAll('.tab-btn');
      const contents = document.querySelectorAll('.day-content');
      let activeDayIndex = 0;
      let showAllRoutes = false;
      let map = null;
      let layers = [];

      const DAY_COLORS = [
        '#2563eb', '#16a34a', '#dc2626', '#d97706', '#9333ea', '#0891b2', '#db2777'
      ];

      // Initialize Map
      function initMap() {
        const mapContainer = document.getElementById('offline-map');
        if (!mapContainer) return;

        map = L.map('offline-map').setView([0, 0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: 'Map data &copy; OpenStreetMap | Trippr',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        renderMapLayers();
      }

      function renderMapLayers() {
        if (!map) return;

        // Clear existing
        layers.forEach(l => map.removeLayer(l));
        layers = [];

        const allPoints = [];
        const bounds = L.latLngBounds([]);
        
        const daysToRender = showAllRoutes 
          ? itineraryData.days 
          : [itineraryData.days[activeDayIndex]];

        daysToRender.forEach((day) => {
          const originalIndex = itineraryData.days.findIndex(d => d.dayNumber === day.dayNumber);
          const dayColor = DAY_COLORS[originalIndex % DAY_COLORS.length];
          const dayPoints = [];

          if (!day.activities) return;

          day.activities.forEach((activity, actIdx) => {
            if (activity.coordinates && activity.coordinates.lat && activity.coordinates.lng) {
              const lat = activity.coordinates.lat;
              const lng = activity.coordinates.lng;
              const latLng = [lat, lng];
              
              dayPoints.push(latLng);
              allPoints.push(latLng);
              bounds.extend(latLng);

              // Custom Icon
              const numberedIcon = L.divIcon({
                className: '',
                html: \`<div style="
                  background-color: \${dayColor}; 
                  width: 24px; height: 24px; 
                  border-radius: 50%; 
                  border: 2px solid white; 
                  display: flex; align-items: center; justify-content: center; 
                  color: white; font-family: sans-serif; font-weight: bold; font-size: 12px; 
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);">\${actIdx + 1}</div>\`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
              });

              const marker = L.marker(latLng, { icon: numberedIcon }).addTo(map);
              const popupContent = \`
                <div class="font-sans min-w-[150px]">
                  <div class="text-xs font-bold text-slate-500 mb-1">第 \${day.dayNumber} 天 - 第 \${actIdx + 1} 站</div>
                  <h3 class="font-bold text-sm text-slate-800 mb-1">\${activity.name}</h3>
                  <p class="text-xs text-slate-600">\${activity.locationName || ''}</p>
                </div>\`;
              marker.bindPopup(popupContent);
              layers.push(marker);
            }
          });

          if (dayPoints.length > 1) {
            const polyline = L.polyline(dayPoints, {
              color: dayColor,
              weight: 3,
              opacity: 0.7,
              dashArray: '5, 5'
            }).addTo(map);
            layers.push(polyline);
          }
        });

        if (allPoints.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        } else if (showAllRoutes) {
           map.setView([20, 0], 2);
        }

        updateLegend();
      }

      function updateLegend() {
        const titleEl = document.getElementById('map-legend-title');
        const contentEl = document.getElementById('map-legend-content');
        const btnEl = document.getElementById('map-toggle-btn');
        
        if(titleEl) titleEl.textContent = showAllRoutes ? '全程路線' : \`第 \${itineraryData.days[activeDayIndex].dayNumber} 天路線\`;
        if(btnEl) btnEl.textContent = showAllRoutes ? '顯示單日路線' : '顯示全程路線';

        if (contentEl) {
          const daysToShow = showAllRoutes ? itineraryData.days : [itineraryData.days[activeDayIndex]];
          contentEl.innerHTML = daysToShow.map(day => {
            const idx = itineraryData.days.findIndex(d => d.dayNumber === day.dayNumber);
            const color = DAY_COLORS[idx % DAY_COLORS.length];
            return \`<div class="flex items-center gap-2 mb-1">
                    <span class="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] text-white font-bold" style="background-color: \${color}">#</span>
                    <span class="truncate text-slate-600">第 \${day.dayNumber} 天</span>
                </div>\`;
          }).join('');
        }
      }

      // Initialize
      initMap();

      // Event Listeners
      const toggleBtn = document.getElementById('map-toggle-btn');
      if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          showAllRoutes = !showAllRoutes;
          renderMapLayers();
        });
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
          activeDayIndex = index;
          // Reset view mode when changing days usually helps focus
          showAllRoutes = false;
          
          const targetId = tab.getAttribute('data-tab-target');
          
          // UI Updates
          tabs.forEach(t => {
            t.classList.remove('bg-slate-800', 'text-white', 'scale-100', 'shadow-lg');
            t.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
          });
          
          tab.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
          tab.classList.add('bg-slate-800', 'text-white', 'scale-100', 'shadow-lg');
          
          contents.forEach(c => c.classList.add('hidden'));
          const target = document.getElementById('day-' + targetId);
          if (target) {
            target.classList.remove('hidden');
            target.classList.remove('animate-fade-in');
            void target.offsetWidth; 
            target.classList.add('animate-fade-in');
          }
          
          tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

          // Update Map
          setTimeout(() => {
             map.invalidateSize(); // Fix leaflet rendering issues when hidden
             renderMapLayers();
          }, 100);
        });
      });
    });
  </script>
</body>
</html>
  `;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${itinerary.title.replace(/\s+/g, '_')}_itinerary.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};