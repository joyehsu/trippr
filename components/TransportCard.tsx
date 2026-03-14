import React from 'react';
import { TransportDetail } from '../types';

interface TransportCardProps {
  transport: TransportDetail;
}

const TransportCard: React.FC<TransportCardProps> = ({ transport }) => {
  const getIcon = (mode: string) => {
    switch (mode) {
      case 'WALK': return '🚶';
      case 'DRIVE': return '🚗';
      case 'TRANSIT': return '🚌';
      case 'TAXI': return '🚕';
      default: return '🚀';
    }
  };

  const linkText = [transport.duration, transport.distance].filter(Boolean).join(' • ');

  return (
    <div className="ml-8 pl-8 border-l-2 border-dashed border-slate-300 py-4 my-2 relative">
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-slate-100 p-1 rounded-full border border-slate-300 text-sm">
        {getIcon(transport.mode)}
      </div>
      <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 group hover:bg-slate-100 transition-colors">
        <div className="flex flex-col">
          <span className="font-medium text-slate-700 flex items-center gap-2">
            {transport.mode === 'WALK' ? '步行' : 
             transport.mode === 'DRIVE' ? '開車' : 
             transport.mode === 'TRANSIT' ? '大眾運輸' : 
             transport.mode === 'TAXI' ? '計程車' : '交通'}
             
             {(transport.duration || transport.distance) && (
               <span className="text-slate-500 font-normal hidden sm:inline">
                 ({[transport.duration, transport.distance].filter(Boolean).join(' / ')})
               </span>
             )}
          </span>
          {transport.notes && <span className="text-xs text-slate-500 mt-1">{transport.notes}</span>}
        </div>
        
        {transport.routeMapUrl && (
          <a 
            href={transport.routeMapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <span>查看路線</span>
            {linkText && <span className="font-normal opacity-80">- {linkText}</span>}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default TransportCard;