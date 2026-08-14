import { AreaResponse } from "generated/core/coreResponses";

const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 140;

const isCoordinatePair = (value: unknown): value is [number, number] => {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    !Array.isArray(value[0]) &&
    !Array.isArray(value[1]) &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
};

const getPrimaryRing = (coordinates: unknown): [number, number][] | null => {
  if (!Array.isArray(coordinates) || !coordinates.length) {
    return null;
  }

  if (isCoordinatePair(coordinates[0])) {
    return coordinates.filter(isCoordinatePair).map(point => [Number(point[0]), Number(point[1])]);
  }

  return getPrimaryRing(coordinates[0]);
};

const getGeometry = (geojson: any) => {
  if (!geojson) {
    return null;
  }

  if (geojson.type === "FeatureCollection") {
    return geojson.features?.[0]?.geometry || null;
  }

  if (geojson.type === "Feature") {
    return geojson.geometry || null;
  }

  if (geojson.type && geojson.coordinates) {
    return geojson;
  }

  if (geojson.geometry) {
    return geojson.geometry;
  }

  return null;
};

export const getAreaPreviewSrc = (area: AreaResponse["data"], fallbackSrc: string) => {
  const imageSrc = area?.attributes?.image;

  if (imageSrc) {
    return imageSrc;
  }

  const geojson = area?.attributes?.geostore?.geojson as any;
  if (!geojson) {
    return fallbackSrc;
  }

  try {
    const parsedGeojson = typeof geojson === "string" ? JSON.parse(geojson) : geojson;
    const geometry = getGeometry(parsedGeojson);
    const ring = getPrimaryRing(geometry?.coordinates);

    if (!ring || !ring.length) {
      return fallbackSrc;
    }

    const lons = ring.map(point => point[0]);
    const lats = ring.map(point => point[1]);
    const minX = Math.min(...lons);
    const maxX = Math.max(...lons);
    const minY = Math.min(...lats);
    const maxY = Math.max(...lats);

    const toSvgPoint = ([lng, lat]: [number, number]) => {
      const x = ((lng - minX) / (maxX - minX || 1)) * PREVIEW_WIDTH;
      const y = PREVIEW_HEIGHT - ((lat - minY) / (maxY - minY || 1)) * PREVIEW_HEIGHT;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    const polygonPoints = ring.map(toSvgPoint).join(" ");
    if (!polygonPoints) {
      return fallbackSrc;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}">
        <rect width="100%" height="100%" fill="#edf5ee" />
        <polygon points="${polygonPoints}" fill="#94BE43" stroke="#2f6f38" stroke-width="3" />
      </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch (error) {
    return fallbackSrc;
  }
};
