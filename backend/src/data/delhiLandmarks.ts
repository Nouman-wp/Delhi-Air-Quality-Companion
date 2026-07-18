export interface LandmarkSeed {
  name: string;
  placeName: string;
  lat: number;
  lon: number;
}

/** Fallback autocomplete source used when no Mapbox token is configured. */
export const delhiLandmarks: LandmarkSeed[] = [
  { name: "Connaught Place", placeName: "Connaught Place, New Delhi", lat: 28.6315, lon: 77.2167 },
  { name: "India Gate", placeName: "India Gate, New Delhi", lat: 28.6129, lon: 77.2295 },
  { name: "Red Fort", placeName: "Red Fort, Delhi", lat: 28.6562, lon: 77.241 },
  { name: "Qutub Minar", placeName: "Qutub Minar, Mehrauli, Delhi", lat: 28.5245, lon: 77.1855 },
  { name: "Hauz Khas Village", placeName: "Hauz Khas Village, New Delhi", lat: 28.5535, lon: 77.2 },
  { name: "Chandni Chowk", placeName: "Chandni Chowk, Delhi", lat: 28.6506, lon: 77.2303 },
  { name: "Saket", placeName: "Saket, New Delhi", lat: 28.5245, lon: 77.2066 },
  { name: "Dwarka Sector 21", placeName: "Dwarka Sector 21, New Delhi", lat: 28.5525, lon: 77.0588 },
  { name: "Rohini", placeName: "Rohini, Delhi", lat: 28.7495, lon: 77.0565 },
  { name: "Indira Gandhi International Airport", placeName: "IGI Airport, New Delhi", lat: 28.5562, lon: 77.1 },
  { name: "Nehru Place", placeName: "Nehru Place, New Delhi", lat: 28.5494, lon: 77.2519 },
  { name: "Karol Bagh", placeName: "Karol Bagh, New Delhi", lat: 28.6519, lon: 77.1909 },
  { name: "Lajpat Nagar", placeName: "Lajpat Nagar, New Delhi", lat: 28.5677, lon: 77.2433 },
  { name: "Vasant Kunj", placeName: "Vasant Kunj, New Delhi", lat: 28.5244, lon: 77.1588 },
  { name: "Noida Sector 18", placeName: "Sector 18, Noida", lat: 28.5697, lon: 77.3261 },
  { name: "Gurugram Cyber Hub", placeName: "Cyber Hub, Gurugram", lat: 28.4949, lon: 77.0891 },
  { name: "AIIMS Delhi", placeName: "AIIMS, New Delhi", lat: 28.5672, lon: 77.21 },
  { name: "Akshardham Temple", placeName: "Akshardham Temple, Delhi", lat: 28.6127, lon: 77.2773 },
  { name: "Yamuna Bank", placeName: "Yamuna Bank, Delhi", lat: 28.6193, lon: 77.2822 },
  { name: "Pitampura", placeName: "Pitampura, Delhi", lat: 28.6998, lon: 77.1345 },
];
