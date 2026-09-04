export interface RouteInfo {
  id: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  category: "Metro" | "Regional/UDAN";
  distanceKm: number;
  trafficWeight: number;
  typicalCarriers: string[];
  basePeriodFare: number;
  isUdan: boolean;
}

export const ROUTES: RouteInfo[] = [
  // 15 Metro Routes
  { id: "DEL-BOM", origin: "DEL", originName: "Delhi", destination: "BOM", destinationName: "Mumbai", category: "Metro", distanceKm: 1148, trafficWeight: 0.142, typicalCarriers: ["IndiGo", "Air India", "Akasa Air", "SpiceJet", "AI Express"], basePeriodFare: 4850, isUdan: false },
  { id: "BOM-BLR", origin: "BOM", originName: "Mumbai", destination: "BLR", destinationName: "Bengaluru", category: "Metro", distanceKm: 842, trafficWeight: 0.088, typicalCarriers: ["IndiGo", "Air India", "Akasa Air"], basePeriodFare: 3950, isUdan: false },
  { id: "DEL-BLR", origin: "DEL", originName: "Delhi", destination: "BLR", destinationName: "Bengaluru", category: "Metro", distanceKm: 1740, trafficWeight: 0.105, typicalCarriers: ["IndiGo", "Air India", "Akasa Air", "SpiceJet"], basePeriodFare: 5600, isUdan: false },
  { id: "DEL-CCU", origin: "DEL", originName: "Delhi", destination: "CCU", destinationName: "Kolkata", category: "Metro", distanceKm: 1305, trafficWeight: 0.076, typicalCarriers: ["IndiGo", "Air India", "SpiceJet"], basePeriodFare: 4900, isUdan: false },
  { id: "BOM-MAA", origin: "BOM", originName: "Mumbai", destination: "MAA", destinationName: "Chennai", category: "Metro", distanceKm: 1033, trafficWeight: 0.058, typicalCarriers: ["IndiGo", "Air India", "Akasa Air"], basePeriodFare: 4400, isUdan: false },
  { id: "BLR-HYD", origin: "BLR", originName: "Bengaluru", destination: "HYD", destinationName: "Hyderabad", category: "Metro", distanceKm: 501, trafficWeight: 0.052, typicalCarriers: ["IndiGo", "Air India", "Akasa Air", "Star Air"], basePeriodFare: 3200, isUdan: false },
  { id: "DEL-HYD", origin: "DEL", originName: "Delhi", destination: "HYD", destinationName: "Hyderabad", category: "Metro", distanceKm: 1260, trafficWeight: 0.065, typicalCarriers: ["IndiGo", "Air India", "Akasa Air", "SpiceJet"], basePeriodFare: 4750, isUdan: false },
  { id: "BOM-GOI", origin: "BOM", originName: "Mumbai", destination: "GOI", destinationName: "Goa", category: "Metro", distanceKm: 435, trafficWeight: 0.048, typicalCarriers: ["IndiGo", "Air India", "Akasa Air", "SpiceJet"], basePeriodFare: 3100, isUdan: false },
  { id: "DEL-AMD", origin: "DEL", originName: "Delhi", destination: "AMD", destinationName: "Ahmedabad", category: "Metro", distanceKm: 775, trafficWeight: 0.044, typicalCarriers: ["IndiGo", "Air India", "SpiceJet"], basePeriodFare: 3700, isUdan: false },
  { id: "BOM-CCU", origin: "BOM", originName: "Mumbai", destination: "CCU", destinationName: "Kolkata", category: "Metro", distanceKm: 1660, trafficWeight: 0.042, typicalCarriers: ["IndiGo", "Air India"], basePeriodFare: 5400, isUdan: false },
  { id: "DEL-PNQ", origin: "DEL", originName: "Delhi", destination: "PNQ", destinationName: "Pune", category: "Metro", distanceKm: 1173, trafficWeight: 0.038, typicalCarriers: ["IndiGo", "Air India", "Akasa Air", "SpiceJet"], basePeriodFare: 4600, isUdan: false },
  { id: "BLR-CCU", origin: "BLR", originName: "Bengaluru", destination: "CCU", destinationName: "Kolkata", category: "Metro", distanceKm: 1560, trafficWeight: 0.035, typicalCarriers: ["IndiGo", "Air India", "Akasa Air"], basePeriodFare: 5150, isUdan: false },
  { id: "DEL-COK", origin: "DEL", originName: "Delhi", destination: "COK", destinationName: "Kochi", category: "Metro", distanceKm: 2080, trafficWeight: 0.032, typicalCarriers: ["IndiGo", "Air India", "AI Express"], basePeriodFare: 6200, isUdan: false },
  { id: "DEL-GAU", origin: "DEL", originName: "Delhi", destination: "GAU", destinationName: "Guwahati", category: "Metro", distanceKm: 1460, trafficWeight: 0.030, typicalCarriers: ["IndiGo", "Air India", "SpiceJet"], basePeriodFare: 5100, isUdan: false },
  { id: "BOM-HYD", origin: "BOM", originName: "Mumbai", destination: "HYD", destinationName: "Hyderabad", category: "Metro", distanceKm: 620, trafficWeight: 0.028, typicalCarriers: ["IndiGo", "Air India", "Akasa Air"], basePeriodFare: 3400, isUdan: false },

  // 10 Regional / UDAN Routes
  { id: "DEL-DED", origin: "DEL", originName: "Delhi", destination: "DED", destinationName: "Dehradun", category: "Regional/UDAN", distanceKm: 208, trafficWeight: 0.012, typicalCarriers: ["IndiGo", "Alliance Air"], basePeriodFare: 3500, isUdan: true },
  { id: "DEL-IXL", origin: "DEL", originName: "Delhi", destination: "IXL", destinationName: "Leh", category: "Regional/UDAN", distanceKm: 625, trafficWeight: 0.014, typicalCarriers: ["IndiGo", "Air India", "SpiceJet"], basePeriodFare: 7200, isUdan: false },
  { id: "GAU-IMF", origin: "GAU", originName: "Guwahati", destination: "IMF", destinationName: "Imphal", category: "Regional/UDAN", distanceKm: 270, trafficWeight: 0.009, typicalCarriers: ["IndiGo", "Alliance Air", "Air India"], basePeriodFare: 3800, isUdan: true },
  { id: "BOM-IXU", origin: "BOM", originName: "Mumbai", destination: "IXU", destinationName: "Aurangabad", category: "Regional/UDAN", distanceKm: 275, trafficWeight: 0.008, typicalCarriers: ["IndiGo"], basePeriodFare: 4600, isUdan: true },
  { id: "BLR-IXG", origin: "BLR", originName: "Bengaluru", destination: "IXG", destinationName: "Belagavi", category: "Regional/UDAN", distanceKm: 460, trafficWeight: 0.007, typicalCarriers: ["Star Air", "IndiGo"], basePeriodFare: 3900, isUdan: true },
  { id: "CCU-IXB", origin: "CCU", originName: "Kolkata", destination: "IXB", destinationName: "Bagdogra", category: "Regional/UDAN", distanceKm: 450, trafficWeight: 0.018, typicalCarriers: ["IndiGo", "SpiceJet", "AI Express"], basePeriodFare: 4200, isUdan: false },
  { id: "DEL-SHL", origin: "DEL", originName: "Delhi", destination: "SHL", destinationName: "Shillong", category: "Regional/UDAN", distanceKm: 1490, trafficWeight: 0.006, typicalCarriers: ["SpiceJet"], basePeriodFare: 7800, isUdan: true },
  { id: "HYD-VGA", origin: "HYD", originName: "Hyderabad", destination: "VGA", destinationName: "Vijayawada", category: "Regional/UDAN", distanceKm: 250, trafficWeight: 0.008, typicalCarriers: ["IndiGo", "Air India"], basePeriodFare: 3100, isUdan: true },
  { id: "BOM-JAI", origin: "BOM", originName: "Mumbai", destination: "JAI", destinationName: "Jaipur", category: "Regional/UDAN", distanceKm: 920, trafficWeight: 0.015, typicalCarriers: ["IndiGo", "Air India"], basePeriodFare: 4300, isUdan: false },
  { id: "DEL-DHM", origin: "DEL", originName: "Delhi", destination: "DHM", destinationName: "Dharamshala", category: "Regional/UDAN", distanceKm: 415, trafficWeight: 0.008, typicalCarriers: ["IndiGo", "SpiceJet"], basePeriodFare: 6900, isUdan: true }
];

export const BOOKING_WINDOWS = ["T+1", "T+7", "T+15", "T+30", "T+45"];
export const WINDOW_WEIGHTS: Record<string, number> = {
  "T+1": 0.15,
  "T+7": 0.30,
  "T+15": 0.25,
  "T+30": 0.20,
  "T+45": 0.10
};
