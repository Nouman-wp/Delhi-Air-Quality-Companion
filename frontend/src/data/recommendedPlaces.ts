export type RecommendedCategory =
  | "landmark"
  | "shopping"
  | "transport"
  | "dining"
  | "business"
  | "market";

export interface RecommendedPlace {
  name: string;
  area: string;
  lat: number;
  lon: number;
  category: RecommendedCategory;
}

/**
 * Curated popular Delhi destinations shown as quick-pick suggestions in the
 * search bar (when empty) and as tappable pins on the map — the "recommended
 * locations" entry points, à la Google Maps' suggested places.
 */
export const recommendedPlaces: RecommendedPlace[] = [
  { name: "India Gate", area: "Rajpath, New Delhi", lat: 28.6129, lon: 77.2295, category: "landmark" },
  { name: "Connaught Place", area: "Central Delhi", lat: 28.6315, lon: 77.2167, category: "business" },
  { name: "Qutub Minar", area: "Mehrauli, South Delhi", lat: 28.5245, lon: 77.1855, category: "landmark" },
  { name: "Lotus Temple", area: "Kalkaji, South Delhi", lat: 28.5535, lon: 77.2588, category: "landmark" },
  { name: "Akshardham Temple", area: "Noida Link Road", lat: 28.6127, lon: 77.2773, category: "landmark" },
  { name: "Red Fort", area: "Chandni Chowk, Old Delhi", lat: 28.6562, lon: 77.241, category: "landmark" },
  { name: "Select Citywalk", area: "Saket, South Delhi", lat: 28.5285, lon: 77.2191, category: "shopping" },
  { name: "DLF Cyber Hub", area: "Gurugram", lat: 28.4949, lon: 77.0891, category: "dining" },
  { name: "Hauz Khas Village", area: "South Delhi", lat: 28.5535, lon: 77.1943, category: "dining" },
  { name: "Chandni Chowk", area: "Old Delhi", lat: 28.6506, lon: 77.2303, category: "market" },
  { name: "Nehru Place", area: "South Delhi", lat: 28.5494, lon: 77.2519, category: "business" },
  { name: "IGI Airport (T3)", area: "Aerocity", lat: 28.5562, lon: 77.0999, category: "transport" },
];
