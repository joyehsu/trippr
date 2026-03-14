import React from 'react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index }) => {
  return (
    <div className="relative pl-8 py-4 group">
      {/* Timeline Node */}
      <div className="absolute left-0 top-6 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center text-xs text-white font-bold">
        {index + 1}
      </div>
      {/* Timeline Line */}
      <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-slate-200 group-last:hidden"></div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
        {/* Header: Name & Time */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-800">
              <a href={activity.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-colors">
                {activity.name}
              </a>
            </h3>
            {activity.locationName && (
               <a 
                 href={activity.googleMapsUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1 mt-0.5"
               >
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 {activity.locationName}
               </a>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 items-start mt-1 sm:mt-0">
            {(activity.startTime || activity.endTime) && (
              <div className="flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {activity.startTime} {activity.endTime && `- ${activity.endTime}`}
              </div>
            )}
            {activity.estimatedCost && (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                💰 {activity.estimatedCost}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-slate-600 text-sm mb-3 leading-relaxed mt-2">
          {activity.description}
        </p>

        {/* Key Info Badges */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3 mt-2">
          {activity.openingHours && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{activity.openingHours}</span>
            </div>
          )}
          {activity.duration && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>建議停留: {activity.duration}</span>
            </div>
          )}
        </div>

        {/* Warnings & Notes Section */}
        {(activity.bookingNotes || activity.fallbackPlan || activity.accessibilityNotes) && (
          <div className="mt-3 space-y-2">
            {activity.bookingNotes && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                <span className="font-bold">⚠️ 預訂:</span> {activity.bookingNotes}
              </div>
            )}
            {activity.fallbackPlan && (
              <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 p-2 rounded">
                <span className="font-bold">☔ 雨天備案:</span> {activity.fallbackPlan}
              </div>
            )}
             {activity.accessibilityNotes && (
              <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-100 p-2 rounded">
                <span className="font-bold">♿ 無障礙:</span> {activity.accessibilityNotes}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
            <a 
              href={activity.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              在 Google 地圖上查看
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
        </div>

        {/* Suggested Restaurants Section */}
        {activity.suggestedRestaurants && activity.suggestedRestaurants.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 bg-orange-50/50 -mx-5 px-5 pb-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-orange-700 mb-3">
              <span className="text-lg">🍽️</span> 附近推薦美食
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activity.suggestedRestaurants.map((restaurant, rIdx) => (
                <div key={rIdx} className="bg-white border border-orange-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-800 text-sm truncate">
                      <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {restaurant.name}
                      </a>
                    </h5>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">{restaurant.cuisine}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{restaurant.description}</p>
                  <div className="flex gap-3 mt-2">
                    <a 
                      href={restaurant.googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      📍 地圖
                    </a>
                    {restaurant.websiteUrl && (
                      <a 
                        href={restaurant.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        🔗 預訂/官網
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;