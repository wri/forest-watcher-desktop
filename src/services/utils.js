import { API_VIZZUALITY_URL_V1, GFW_DATA_API_URL, GFW_DATA_API_KEY } from "../constants/global";
import { BaseService } from "./baseService";

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
    if (!GFW_DATA_API_URL) throw new Error("Missing REACT_APP_GFW_DATA_API_URL");
    if (!GFW_DATA_API_KEY) throw new Error("Missing REACT_APP_GFW_DATA_API_KEY");

    const response = await fetch(GFW_DATA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": GFW_DATA_API_KEY
      },
      body: JSON.stringify({
        sql: "SELECT name_0, gid_0, gfw_bbox FROM data WHERE adm_level='0' AND gid_0 not like 'Z0%%' ORDER BY name_0"
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    return {
      rows: (json.data || []).map(country => ({
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
