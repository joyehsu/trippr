import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TripItinerary } from "../types";

// Define the schema for the output
const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the trip" },
    summary: { type: Type.STRING, description: "A brief summary of the entire itinerary" },
    pace: { type: Type.STRING, description: "Overall pace: e.g. 'Relaxed', 'Packed', 'Standard'" },
    transportStrategy: { type: Type.STRING, description: "Main transport mode overview, e.g. 'Public Transit + JR Pass' or 'Self-drive'" },
    routeConcept: { type: Type.STRING, description: "Brief description of the geographical flow" },
    budgetEstimate: {
      type: Type.OBJECT,
      properties: {
        total: { type: Type.STRING, description: "Total estimated cost string" },
        breakdown: {
          type: Type.OBJECT,
          properties: {
            transport: { type: Type.STRING },
            dining: { type: Type.STRING },
            tickets: { type: Type.STRING },
            other: { type: Type.STRING }
          }
        }
      }
    },
    riskManagement: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of general risks: typhoons, holidays, strikes, etc."
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          date: { type: Type.STRING },
          theme: { type: Type.STRING },
          dailyBudgetEstimate: { type: Type.STRING, description: "Rough estimate for the day" },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                duration: { type: Type.STRING, description: "Suggested stay duration e.g. '2 hours'" },
                locationName: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  }
                },
                googleMapsUrl: { type: Type.STRING },
                openingHours: { type: Type.STRING },
                estimatedCost: { type: Type.STRING, description: "Cost for ticket/entry e.g. '2000 JPY'" },
                bookingNotes: { type: Type.STRING, description: "Reservation requirements or 'Walk-in'" },
                fallbackPlan: { type: Type.STRING, description: "Alternative if closed or bad weather" },
                accessibilityNotes: { type: Type.STRING, description: "Wheelchair/stroller access notes" },
                transportToNext: {
                  type: Type.OBJECT,
                  properties: {
                    mode: { type: Type.STRING, enum: ['WALK', 'DRIVE', 'TRANSIT', 'TAXI', 'OTHER'] },
                    duration: { type: Type.STRING },
                    distance: { type: Type.STRING, description: "e.g. 500m or 10km" },
                    notes: { type: Type.STRING },
                    routeMapUrl: { type: Type.STRING }
                  }
                },
                suggestedRestaurants: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      cuisine: { type: Type.STRING },
                      description: { type: Type.STRING },
                      googleMapsUrl: { type: Type.STRING },
                      websiteUrl: { type: Type.STRING }
                    },
                    required: ["name", "googleMapsUrl"]
                  }
                }
              },
              required: ["name", "locationName", "googleMapsUrl"]
            }
          }
        },
        required: ["dayNumber", "activities"]
      }
    }
  },
  required: ["title", "days"]
};

export const parseItinerary = async (text: string, userApiKey?: string): Promise<TripItinerary> => {
  const apiKey = userApiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("請先設定您的 Google Gemini API Key。");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a detailed Travel Planner AI. 
    Analyze the unstructured travel text and convert it into a HIGHLY STRUCTURED JSON itinerary.

    **Requirements for Extraction & Map Links (CRITICAL):**
    1. **Google Maps URLs**:
       - **Activities**: Generate a functional Google Maps Search URL for EVERY location.
         Format: \`https://www.google.com/maps/search/?api=1&query={Specific+Place_Name}+{City/Region}\`
         *IMPORTANT*: ALWAYS append the city or region to the query to disambiguate (e.g., "Grand Hotel" exists in many cities).
         If the destination is in a non-English speaking country, prefer the **Native/Local Name** + **City** (e.g. "清水寺 Kyoto" instead of "Pure Water Temple").
       - **Routes (transportToNext)**: Generate a functional Google Maps Directions URL between activities.
         Format: \`https://www.google.com/maps/dir/?api=1&origin={Origin_Name}+{City}&destination={Destination_Name}+{City}&travelmode={driving|transit|walking}\`
         (Ensure origin/destination names include city context to avoid routing errors).
    2. **Transport Data**: 
       - Estimate realistic **duration** (e.g., "25 mins") and **distance** (e.g., "3.2 km") for movement between places.
    3. **Logistics**: Estimate Lat/Lng for visualization if possible.
    4. **Planning Meta-data**: 
       - Infer 'pace', 'transportStrategy', and 'budgetEstimate'.
    5. **Activity Details**:
       - 'estimatedCost', 'bookingNotes', 'fallbackPlan', 'accessibilityNotes'.
    6. **Restaurants**: 
       - Suggest 1-2 nearby restaurants if none provided.
       - Ensure restaurant Map URLs also use the \`{Restaurant_Name}+{City}\` format for accuracy.
    
    **Language**: 
    - Output primarily in Traditional Chinese (zh-TW).
    - Map Query Parameters (origin, destination, query) should use the most accurate searchable name (English or Local).
    
    Itinerary Text:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        thinkingConfig: { thinkingBudget: 4096 }
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(response.text) as TripItinerary;
    return data;

  } catch (error) {
    console.error("Error parsing itinerary:", error);
    throw error;
  }
};