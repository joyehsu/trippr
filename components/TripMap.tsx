import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TripItinerary } from '../types';

interface TripMapProps {
  itinerary: TripItinerary;
  activeDay: number;
}

const DAY_COLORS = [
  '#2563eb', // Blue (Day 1)
  '#16a34a', // Green (Day 2)
  '#dc2626', // Red (Day 3)
  '#d97706', // Amber (Day 4)
  '#9333ea', // Purple (Day 5)
  '#0891b2', // Cyan
  '#db2777', // Pink
];

const TripMap: React.FC<TripMapProps> = ({ itinerary, activeDay }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Reset to single day view when activeDay changes externally
  useEffect(() => {
    setShowAll(false);
  }, [activeDay]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    const allPoints: L.LatLngExpression[] = [];
    const bounds = L.latLngBounds([]);

    // Determine which days to render
    const daysToRender = showAll 
      ? itinerary.days 
      : [itinerary.days[activeDay]];

    // Iterate through days to plot markers and lines
    daysToRender.forEach((day) => {
      // Use the original day index for consistent coloring
      const originalIndex = itinerary.days.findIndex(d => d.dayNumber === day.dayNumber);
      const dayColor = DAY_COLORS[originalIndex % DAY_COLORS.length];
      const dayPoints: L.LatLngExpression[] = [];

      day.activities.forEach((activity, actIdx) => {
        if (activity.coordinates && activity.coordinates.lat && activity.coordinates.lng) {
          const { lat, lng } = activity.coordinates;
          const latLng: L.LatLngExpression = [lat, lng];
          
          dayPoints.push(latLng);
          allPoints.push(latLng);
          bounds.extend(latLng);

          // Create custom numbered icon
          const numberedIcon = L.divIcon({
            className: '', // Empty class to remove default Leaflet styles
            html: `
              <div style="
                background-color: ${dayColor}; 
                width: 24px; 
                height: 24px; 
                border-radius: 50%; 
                border: 2px solid white; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-family: sans-serif; 
                font-weight: bold; 
                font-size: 12px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                ${actIdx + 1}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12], // Center the icon over the point
            popupAnchor: [0, -12]
          });

          // Create marker with custom icon
          const marker = L.marker(latLng, { icon: numberedIcon }).addTo(map);

          // Popup content
          const popupContent = `
            <div class="font-sans min-w-[150px]">
              <div class="text-xs font-bold text-slate-500 mb-1">第 ${day.dayNumber} 天 - 第 ${actIdx + 1} 站</div>
              <h3 class="font-bold text-sm text-slate-800 mb-1">${activity.name}</h3>
              <p class="text-xs text-slate-600">${activity.locationName || ''}</p>
            </div>
          `;
          
          marker.bindPopup(popupContent);
        }
      });

      // Draw lines connecting activities for this day
      if (dayPoints.length > 1) {
        L.polyline(dayPoints, {
          color: dayColor,
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5' // Dashed line to indicate travel
        }).addTo(map);
      }
    });

    // Fit bounds if we have points
    if (allPoints.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        // Maintain center but zoom out if no points for this day, or default view
        if (showAll && mapInstanceRef.current) {
             map.setView([20, 0], 2);
        }
    }

  }, [itinerary, activeDay, showAll]);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 relative group">
       <div ref={mapRef} className="w-full h-full bg-slate-100" />
       
       {/* Controls Overlay */}
       <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
         <button
            onClick={() => setShowAll(!showAll)}
            className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-md text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
         >
           {showAll ? '顯示單日路線' : '顯示全程路線'}
         </button>
       </div>

       {/* Legend overlay */}
       <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-md text-xs z-[1000] border border-slate-100 max-w-[150px]">
          <h4 className="font-bold mb-2 text-slate-700">
            {showAll ? '全程路線' : `第 ${itinerary.days[activeDay].dayNumber} 天路線`}
          </h4>
          <div className="space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
            {(showAll ? itinerary.days : [itinerary.days[activeDay]]).map((day) => {
               const idx = itinerary.days.findIndex(d => d.dayNumber === day.dayNumber);
               return (
                <div key={day.dayNumber} className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] text-white font-bold" 
                      style={{ backgroundColor: DAY_COLORS[idx % DAY_COLORS.length] }}
                    >#</span>
                    <span className="truncate text-slate-600">第 {day.dayNumber} 天</span>
                </div>
               );
            })}
          </div>
       </div>
    </div>
  );
};

export default TripMap;