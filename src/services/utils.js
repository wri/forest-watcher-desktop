import { API_VIZZUALITY_URL_V1 } from "../constants/global";
import { BaseService } from "./baseService";
import countriesData from "../assets/data/countries.json";

// Transform a GFW Data API bbox tuple [minX, minY, maxX, maxY] into a
// stringified GeoJSON Polygon, matching the format expected by country consumers.
const bboxToGeoJSONPolygon = bbox => {
  if (!Array.isArray(bbox) || bbox.length < 4) return null;
  const [minX, minY, maxX, maxY] = bbox.slice(0, 4).map(Number);
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;
  if (minX > maxX || minY > maxY) return null;
  return JSON.stringify({
    type: "Polygon",
    coordinates: [
      [
        [minX, minY],
        [minX, maxY],
        [maxX, maxY],
        [maxX, minY],
        [minX, minY]
      ]
    ]
  });
};

export class UtilsService extends BaseService {
  async getCountries() {
    return {
      rows: (countriesData.data || []).map(country => ({
        gid_0: country.gid_0,
        name_0: country.name_0,
        bbox: bboxToGeoJSONPolygon(country.gfw_bbox)
      }))
    };
  }

  getGeoJSONFromShapeFile(token, shapefile) {
    const url = `${API_VIZZUALITY_URL_V1}/ogr/convert`;
    this.token = token;

    const body = new FormData();
    body.append("file", shapefile);

    return this.fetchJSON(url, {
      method: "POST",
      body
    });
  }
}

export const utilsService = new UtilsService("");
