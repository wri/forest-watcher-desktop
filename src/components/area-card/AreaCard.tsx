import { FC, HTMLAttributes, ReactEventHandler } from "react";
import { FormattedMessage } from "react-intl";
import * as turf from "@turf/turf";
import Card from "components/ui/Card/Card";
import EditIcon from "assets/images/icons/Edit.svg";
import classNames from "classnames";
import { AreaResponse } from "generated/core/coreResponses";
import DefaultAreaThumbnail from "assets/images/DefaultAreaThumbnail.svg";

const getAreaPreviewSrc = (area: AreaResponse["data"]) => {
  const imageSrc = area?.attributes?.image;

  if (imageSrc) {
    return imageSrc;
  }

  const geojson = area?.attributes?.geostore?.geojson as any;
  if (!geojson) {
    return DefaultAreaThumbnail;
  }

  try {
    const parsedGeojson = typeof geojson === "string" ? JSON.parse(geojson) : geojson;
    const geometry =
      parsedGeojson?.type === "FeatureCollection"
        ? parsedGeojson.features?.[0]?.geometry
        : parsedGeojson?.geometry || parsedGeojson;
    const coordinates = geometry?.coordinates;

    if (!coordinates || !Array.isArray(coordinates)) {
      return DefaultAreaThumbnail;
    }

    const ring = Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0]) ? coordinates[0] : coordinates;
    if (!Array.isArray(ring) || !ring.length || !Array.isArray(ring[0])) {
      return DefaultAreaThumbnail;
    }

    const geometryForBbox = { type: "Feature", geometry, properties: {} };
    const [minX, minY, maxX, maxY] = turf.bbox(geometryForBbox as any);
    const width = 240;
    const height = 140;

    const toSvgPoint = ([lng, lat]: number[]) => {
      const x = ((lng - minX) / (maxX - minX || 1)) * width;
      const y = height - ((lat - minY) / (maxY - minY || 1)) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    const polygonPoints = ring
      .filter((point: any) => Array.isArray(point) && point.length >= 2)
      .map(toSvgPoint)
      .join(" ");

    if (!polygonPoints) {
      return DefaultAreaThumbnail;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#edf5ee" />
        <polygon points="${polygonPoints}" fill="#94BE43" stroke="#2f6f38" stroke-width="3" />
      </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch (error) {
    return DefaultAreaThumbnail;
  }
};

interface IProps extends HTMLAttributes<HTMLDivElement> {
  area: AreaResponse["data"];
  subtitleKey?: string;
  subtitleValue?: any;
}

const AreaCard: FC<IProps> = ({ className, area, subtitleKey, subtitleValue }) => {
  const imageSrc = getAreaPreviewSrc(area);

  const handleThumbnailLoadError: ReactEventHandler<HTMLImageElement> = e => {
    e.currentTarget.src = DefaultAreaThumbnail;
  };

  return (
    <Card size="large" className={classNames("c-area-card", className)}>
      <Card.Image
        alt=""
        src={imageSrc}
        loading="lazy"
        onError={handleThumbnailLoadError}
        className="c-area-card__image"
      />
      <div className="c-card__content-flex">
        <div className="u-text-ellipsis u-flex-1">
          <Card.Title className="u-margin-top-none">{area?.attributes?.name}</Card.Title>
          {subtitleKey && (
            <Card.Text className="u-margin-top-tiny">
              <FormattedMessage id={subtitleKey} values={subtitleValue} />
            </Card.Text>
          )}
        </div>
        <Card.Cta to={`/areas/${area?.id}`} iconSrc={EditIcon}>
          <FormattedMessage id="common.manage" />
        </Card.Cta>
      </div>
    </Card>
  );
};
export default AreaCard;
