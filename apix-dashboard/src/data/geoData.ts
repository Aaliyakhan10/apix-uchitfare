export interface AirportGeo {
  iata: string;
  city: string;
  lat: number;
  lng: number;
}

export const AIRPORTS: Record<string, AirportGeo> = {
  DEL: { iata: "DEL", city: "Delhi", lat: 28.5562, lng: 77.1000 },
  BOM: { iata: "BOM", city: "Mumbai", lat: 19.0896, lng: 72.8656 },
  BLR: { iata: "BLR", city: "Bengaluru", lat: 13.1986, lng: 77.7066 },
  CCU: { iata: "CCU", city: "Kolkata", lat: 22.6520, lng: 88.4463 },
  HYD: { iata: "HYD", city: "Hyderabad", lat: 17.2403, lng: 78.4294 },
  MAA: { iata: "MAA", city: "Chennai", lat: 12.9941, lng: 80.1709 },
  GAU: { iata: "GAU", city: "Guwahati", lat: 26.1061, lng: 91.5859 },
  GOI: { iata: "GOI", city: "Goa", lat: 15.3808, lng: 73.8314 },
  AMD: { iata: "AMD", city: "Ahmedabad", lat: 23.0772, lng: 72.6347 },
  PNQ: { iata: "PNQ", city: "Pune", lat: 18.5822, lng: 73.9197 },
  COK: { iata: "COK", city: "Kochi", lat: 10.1556, lng: 76.3917 },
  DED: { iata: "DED", city: "Dehradun", lat: 30.1897, lng: 78.1803 },
  IXL: { iata: "IXL", city: "Leh", lat: 34.1359, lng: 77.5465 },
  IMF: { iata: "IMF", city: "Imphal", lat: 24.7600, lng: 93.8967 },
  IXU: { iata: "IXU", city: "Aurangabad", lat: 19.8631, lng: 75.3981 },
  IXG: { iata: "IXG", city: "Belagavi", lat: 15.8593, lng: 74.6183 },
  IXB: { iata: "IXB", city: "Bagdogra", lat: 26.6812, lng: 88.3286 },
  SHL: { iata: "SHL", city: "Shillong", lat: 25.7036, lng: 91.9786 },
  VGA: { iata: "VGA", city: "Vijayawada", lat: 16.5304, lng: 80.7968 },
  JAI: { iata: "JAI", city: "Jaipur", lat: 26.8242, lng: 75.8122 },
  DHM: { iata: "DHM", city: "Dharamshala", lat: 32.1651, lng: 76.2634 }
};
