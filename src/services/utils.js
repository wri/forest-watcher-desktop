import { API_VIZZUALITY_URL_V1 } from "../constants/global";
import { BaseService } from "./baseService";
// countries.json was generated using the GFW Data API for administrative boundaries.
// curl -X POST --post302 -L -H 'x-api-key: xxx' https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1.85/query/json --header 'Content-Type: application/json' --data '{ "sql": "SELECT name_0, gid_0, gfw_bbox FROM data WHERE adm_level=%270%27 AND gid_0 not like %27Z0%%%27 ORDER BY name_0"}' -o countries.json
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
