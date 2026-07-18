import type { Place } from "../types/index.js";

/** Curated seed data of well-known Delhi parks, gardens and green corridors. */
export const delhiParks: Place[] = [
  {
    id: "lodhi-garden",
    name: "Lodhi Garden",
    type: "park",
    location: { lat: 28.5931, lon: 77.2197 },
    description: "Historic 90-acre garden with wide tree-lined paths, popular for walking and jogging.",
  },
  {
    id: "deer-park",
    name: "Deer Park, Hauz Khas",
    type: "park",
    location: { lat: 28.5535, lon: 77.2 },
    description: "Large green space bordering Hauz Khas lake with a dedicated running track.",
  },
  {
    id: "nehru-park",
    name: "Nehru Park",
    type: "park",
    location: { lat: 28.5875, lon: 77.1913 },
    description: "80-acre landscaped park in Chanakyapuri, popular with morning walkers and yoga groups.",
  },
  {
    id: "central-park-cp",
    name: "Central Park, Connaught Place",
    type: "park",
    location: { lat: 28.6315, lon: 77.2167 },
    description: "Circular central green at the heart of CP, well ventilated open space.",
  },
  {
    id: "sanjay-van",
    name: "Sanjay Van",
    type: "trail",
    location: { lat: 28.5245, lon: 77.1855 },
    description: "Dense urban forest with unpaved trails, one of the greenest lungs of south Delhi.",
  },
  {
    id: "garden-of-five-senses",
    name: "Garden of Five Senses",
    type: "garden",
    location: { lat: 28.5152, lon: 77.1996 },
    description: "Themed landscaped garden in Saket with paved walking paths and sculpture trails.",
  },
  {
    id: "yamuna-biodiversity-park",
    name: "Yamuna Biodiversity Park",
    type: "park",
    location: { lat: 28.7594, lon: 77.2278 },
    description: "Large restored wetland and grassland ecosystem, generally cleaner air away from traffic.",
  },
  {
    id: "japanese-park-rohini",
    name: "Japanese Park, Rohini",
    type: "park",
    location: { lat: 28.7248, lon: 77.1122 },
    description: "One of Delhi's largest parks with a lake, jogging track and open lawns.",
  },
  {
    id: "district-park-dwarka",
    name: "District Park, Dwarka",
    type: "park",
    location: { lat: 28.5921, lon: 77.046 },
    description: "Spacious neighborhood park with cycling and walking tracks in Dwarka.",
  },
  {
    id: "aravalli-biodiversity-park",
    name: "Aravalli Biodiversity Park",
    type: "trail",
    location: { lat: 28.4989, lon: 77.1601 },
    description: "Reforested Aravalli scrubland in Gurugram-Delhi border with extensive trail network.",
  },
  {
    id: "jln-stadium-complex",
    name: "Jawaharlal Nehru Stadium Sports Complex",
    type: "sports-complex",
    location: { lat: 28.5895, lon: 77.2334 },
    description: "Public sports complex with athletics track suitable for structured running sessions.",
  },
  {
    id: "millennium-park",
    name: "Millennium Park, ITO",
    type: "park",
    location: { lat: 28.6355, lon: 77.2431 },
    description: "Riverside park along the Yamuna, open lawns with river breeze.",
  },
];
