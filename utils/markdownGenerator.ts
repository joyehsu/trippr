import { TripItinerary } from '../types';

export const generateMarkdown = (itinerary: TripItinerary): string => {
  let md = `# ${itinerary.title}\n\n`;

  // Section 1: Itinerary Overview
  md += `## 1. 行程總覽 (Overview)\n\n`;
  if (itinerary.summary) md += `> **摘要**: ${itinerary.summary}\n\n`;
  
  md += `- **📅 旅程天數**: ${itinerary.days.length} 天\n`;
  if (itinerary.pace) md += `- **⚡ 節奏**: ${itinerary.pace}\n`;
  if (itinerary.transportStrategy) md += `- **🚆 交通策略**: ${itinerary.transportStrategy}\n`;
  if (itinerary.routeConcept) md += `- **📍 主要動線**: ${itinerary.routeConcept}\n`;
  
  if (itinerary.budgetEstimate) {
    const b = itinerary.budgetEstimate;
    md += `- **💰 總預算概算**: ${b.total}\n`;
    if (b.breakdown) {
      md += `  - 交通: ${b.breakdown.transport || 'N/A'}\n`;
      md += `  - 餐飲: ${b.breakdown.dining || 'N/A'}\n`;
      md += `  - 門票: ${b.breakdown.tickets || 'N/A'}\n`;
      md += `  - 其他: ${b.breakdown.other || 'N/A'}\n`;
    }
  }
  md += `\n---\n\n`;

  // Section 2: Daily Itinerary
  md += `## 2. 每日行程細節 (Daily Itinerary)\n\n`;

  itinerary.days.forEach((day) => {
    md += `### 🗓️ 第 ${day.dayNumber} 天${day.date ? ` (${day.date})` : ''}: ${day.theme || ''}\n`;
    if (day.dailyBudgetEstimate) md += `> 💵 本日預算估計: ${day.dailyBudgetEstimate}\n\n`;

    day.activities.forEach((activity, index) => {
      const title = activity.name;
      const coords = activity.coordinates ? `(${activity.coordinates.lat.toFixed(4)}, ${activity.coordinates.lng.toFixed(4)})` : '';
      
      md += `#### ${index + 1}. [${title}](${activity.googleMapsUrl}) ${coords}\n`;
      
      // Basic Info
      md += `- **📝 簡介**: ${activity.description}\n`;
      
      const timeInfo = [];
      if (activity.startTime) timeInfo.push(`${activity.startTime}${activity.endTime ? ` - ${activity.endTime}` : ''}`);
      if (activity.duration) timeInfo.push(`停留約 ${activity.duration}`);
      if (timeInfo.length) md += `- **⏰ 時間**: ${timeInfo.join(' | ')}\n`;
      
      if (activity.openingHours) md += `- **ℹ️ 開放時間**: ${activity.openingHours}\n`;
      if (activity.estimatedCost) md += `- **💲 預估費用**: ${activity.estimatedCost}\n`;
      if (activity.bookingNotes) md += `- **🎫 訂位/購票**: ${activity.bookingNotes}\n`;
      if (activity.accessibilityNotes) md += `- **♿ 無障礙/友善提示**: ${activity.accessibilityNotes}\n`;
      if (activity.fallbackPlan) md += `- **☔ 雨天/備案**: ${activity.fallbackPlan}\n`;

      // Transport to next
      if (activity.transportToNext) {
        const t = activity.transportToNext;
        md += `\n> **⬇️ 前往下一站**: [查看路線](${t.routeMapUrl || '#'}) \n`;
        md += `> - 方式: ${t.mode}\n`;
        if (t.duration) md += `> - 時間: ${t.duration}\n`;
        if (t.distance) md += `> - 距離: ${t.distance}\n`;
        if (t.notes) md += `> - 備註: ${t.notes}\n`;
      }
      
      // Restaurants
      if (activity.suggestedRestaurants && activity.suggestedRestaurants.length > 0) {
        md += `\n**🍽️ 附近推薦用餐**:\n`;
        activity.suggestedRestaurants.forEach(r => {
          md += `- [${r.name}](${r.googleMapsUrl}) (${r.cuisine}): ${r.description}`;
          if (r.websiteUrl) md += ` [預約連結](${r.websiteUrl})`;
          md += `\n`;
        });
      }
      md += `\n`;
    });
    md += `\n`;
  });
  
  md += `---\n\n`;

  // Section 3: Reservations & Tickets Summary
  md += `## 3. ⚠️ 訂位與票券檢查清單 (Reservations)\n\n`;
  let hasReservations = false;
  itinerary.days.forEach(day => {
    day.activities.forEach(act => {
      if (act.bookingNotes && !act.bookingNotes.includes('無') && !act.bookingNotes.includes('None')) {
        hasReservations = true;
        md += `- **第 ${day.dayNumber} 天 - ${act.name}**: ${act.bookingNotes}\n`;
      }
    });
  });
  if (!hasReservations) md += `*本行程似乎無需特別提前預訂，但建議熱門餐廳仍可先行確認。*\n`;
  md += `\n---\n\n`;

  // Section 4: Cost & Risk Management
  md += `## 4. 📊 成本與風險控管 (Costs & Risks)\n\n`;
  
  if (itinerary.riskManagement && itinerary.riskManagement.length > 0) {
    md += `### 風險清單\n`;
    itinerary.riskManagement.forEach(risk => md += `- ⚠️ ${risk}\n`);
    md += `\n`;
  } else {
    md += `### 風險提示\n- 建議出發前再次確認天氣與交通營運狀況。\n\n`;
  }

  md += `### 預算總結\n`;
  if (itinerary.budgetEstimate?.total) {
    md += `- **預估總花費**: ${itinerary.budgetEstimate.total}\n`;
    md += `- *此為概算，實際費用視匯率與個人消費習慣而定。*\n`;
  } else {
    md += `- 未提供詳細預算資訊。\n`;
  }

  return md;
};