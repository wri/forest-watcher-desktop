import MapSatImage from "assets/images/icons/MapSat.png";
import MapLightImage from "assets/images/icons/MapLight.png";
import MapDarkImage from "assets/images/icons/MapDark.png";
import MapPlanetImage from "assets/images/icons/MapPlanet.png";

const MAPBOX_PREVIEW_TOKEN = process.env.REACT_APP_MAPBOX_API_ACCESS_TOKEN;

const getMapPreviewUrl = (styleId: string, fallbackImage: string) => {
  if (!MAPBOX_PREVIEW_TOKEN) {
    return fallbackImage;
  }

  return `https://api.mapbox.com/styles/v1/mapbox/${styleId}/static/-5.9095,54.6064,6.9,0/300x182?access_token=${MAPBOX_PREVIEW_TOKEN}`;
};

export const BASEMAPS = {
  satellite: {
    key: "maps.satellite",
    style: "mapbox://styles/mapbox/satellite-v9",
    image: getMapPreviewUrl("satellite-v9", MapSatImage)
  },
  light: {
    key: "maps.light",
    style: "mapbox://styles/mapbox/light-v11",
    image: getMapPreviewUrl("light-v11", MapLightImage)
  },
  dark: {
    key: "maps.dark",
    style: "mapbox://styles/mapbox/dark-v11",
    image: getMapPreviewUrl("dark-v11", MapDarkImage)
  }
};

export const PLANET_BASEMAP = {
  key: "maps.planet",
  style: "mapbox://styles/mapbox/dark-v11",
  image: MapPlanetImage,
  url: `https://tiles.planet.com/basemaps/v1/planet-tiles/{name}/gmap/{z}/{x}/{y}.png?proc={proc}&api_key=${process.env.REACT_APP_PLANET_API_KEY}`
  // url: "https://globalforestwatch.org/api/planet-tiles/{name}/gmap/{z}/{x}/{y}/?proc="
}; // Look at using https://tiles.planet.com/basemaps/v1/planet-tiles/
