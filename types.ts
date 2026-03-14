export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TransportDetail {
  mode: 'WALK' | 'DRIVE' | 'TRANSIT' | 'TAXI' | 'OTHER';
  duration?: string;
  distance?: string; // Added distance
  cost?: string;
  notes?: string;
  routeMapUrl?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  description: string;
  googleMapsUrl: string;
  websiteUrl?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  startTime?: string;
  endTime?: string;
  duration?: string; // Estimated stay duration
  locationName: string;
  coordinates?: Coordinates;
  googleMapsUrl: string;
  openingHours?: string;
  estimatedCost?: string; // Cost for this specific activity
  bookingNotes?: string; // Reservation needs
  fallbackPlan?: string; // Weather/Crowd alternative
  accessibilityNotes?: string; // Elderly/Kids friendliness
  transportToNext?: TransportDetail;
  suggestedRestaurants?: Restaurant[];
}

export interface DayItinerary {
  dayNumber: number;
  date?: string;
  theme?: string;
  dailyBudgetEstimate?: string;
  activities: Activity[];
}

export interface BudgetEstimate {
  total: string;
  breakdown: {
    transport: string;
    dining: string;
    tickets: string;
    other: string;
  };
}

export interface TripItinerary {
  title: string;
  summary: string;
  pace?: string; // e.g., Relaxed, Fast
  transportStrategy?: string; // e.g., JR Pass, Rental Car
  routeConcept?: string; // Main movement logic
  budgetEstimate?: BudgetEstimate;
  riskManagement?: string[]; // General risks (weather, holidays)
  days: DayItinerary[];
}

export enum ViewMode {
  VISUAL = 'VISUAL',
  MARKDOWN = 'MARKDOWN',
  JSON = 'JSON'
}