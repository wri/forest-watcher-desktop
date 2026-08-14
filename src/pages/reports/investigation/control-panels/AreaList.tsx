import { FC, ReactEventHandler, useMemo } from "react";
import { RouteComponentProps, useLocation } from "react-router-dom";
import * as turf from "@turf/turf";
import MapCard from "components/ui/Map/components/cards/MapCard";
import Card from "components/ui/Card/Card";
import { FormattedMessage, useIntl } from "react-intl";
import Loader from "components/ui/Loader";
import useUrlQuery from "hooks/useUrlQuery";
import useGetAreas from "hooks/querys/areas/useGetAreas";
import DefaultAreaThumbnail from "assets/images/DefaultAreaThumbnail.svg";

const getAreaPreviewSrc = (area: any) => {
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

interface IProps extends RouteComponentProps {}

const AreaListAreaCard: FC<{ area: any; teamId?: string }> = ({ area, teamId }) => {
  const intl = useIntl();
  const location = useLocation();
  const urlQuery = useUrlQuery();
  const scrollToAreaId = useMemo(() => urlQuery.get("scrollToAreaId"), [urlQuery]);
  const scrollToTeamId = useMemo(() => urlQuery.get("scrollToTeamId"), [urlQuery]);

  const areaCreatedDate = new Date(area.attributes.createdAt);
  const day = ("0" + areaCreatedDate.getDate()).slice(-2),
    month = intl.formatMessage({ id: `common.date.month.${areaCreatedDate.getMonth()}` }),
    year = areaCreatedDate.getFullYear();

  const handleCardRef = (id: string, el: HTMLDivElement | null) => {
    if (id === scrollToAreaId && el && (teamId === scrollToTeamId || (!teamId && scrollToTeamId === null))) {
      // @ts-ignore Not a standard function.
      if (el.scrollIntoViewIfNeeded) {
        // @ts-ignore Not a standard function.
        el.scrollIntoViewIfNeeded();
      } else {
        el.scrollIntoView();
      }
    }
  };

  const handleThumbnailLoadError: ReactEventHandler<HTMLImageElement> = e => {
    e.currentTarget.src = DefaultAreaThumbnail;
  };
  const imageSrc = getAreaPreviewSrc(area);

  return (
    <div className="c-map-control-panel__grid-item" ref={el => handleCardRef(area.id, el)}>
      <Card className="c-map-control-panel__area-card" size="small">
        <Card.Image
          alt=""
          src={imageSrc}
          loading="lazy"
          className="c-area-card__image c-map-control-panel__area-card-image"
          onError={handleThumbnailLoadError}
        />
        <div className="c-map-control-panel__area-card-content">
          <Card.Title className="u-margin-top-none">{area.attributes.name}</Card.Title>
          <Card.Text className="u-margin-top-none">
            <FormattedMessage id="reporting.control.panel.area.created.at">
              {txt => <>{`${txt} ${day} ${month} ${year}`}</>}
            </FormattedMessage>
          </Card.Text>
          <Card.Cta to={`${location.pathname}/${area.id}${teamId ? `?scrollToTeamId=${teamId}` : ""}`} />
        </div>
      </Card>
    </div>
  );
};

const AreaListControlPanel: FC<IProps> = props => {
  const intl = useIntl();

  const {
    data: { userAreas, areasByTeam },
    isLoading: isLoadingAreas
  } = useGetAreas();

  return (
    <MapCard
      className="c-map-control-panel"
      title={intl.formatMessage({ id: "reporting.control.panel.area.list.title" })}
    >
      <Loader isLoading={isLoadingAreas} />
      <h3 className="c-map-control-panel__sub-title">
        <FormattedMessage id="reporting.control.panel.area.list.your.areas" />
      </h3>
      <div className="c-map-control-panel__grid">
        {[...userAreas]
          .sort((a, b) => {
            const aStr = a.attributes?.name || "";
            const bStr = b.attributes?.name || "";

            return aStr.localeCompare(bStr.toString());
          })
          .map(area => (
            <AreaListAreaCard key={area.id} area={area} />
          ))}
      </div>

      {!isLoadingAreas && Boolean(areasByTeam.length) && (
        <div className="c-map-control-panel__team-areas">
          <h3 className="c-map-control-panel__sub-title">
            <FormattedMessage id="reporting.control.panel.area.list.team.areas" />
          </h3>
          {areasByTeam.map(
            teamArea =>
              teamArea.team && (
                // @ts-ignore incorrect typings
                <div className="u-margin-bottom-24" key={teamArea.team?.id}>
                  {/* @ts-ignore incorrect typings */}
                  <h4 className="c-map-control-panel__team-name">{teamArea.team?.name}</h4>
                  <div className="c-map-control-panel__grid">
                    {[...(teamArea.areas || [])]
                      .sort((a, b) => {
                        const aStr = a.data?.attributes?.name || "";
                        const bStr = b.data?.attributes?.name || "";

                        return aStr.localeCompare(bStr.toString());
                      })
                      .map(({ data: area }) => (
                        // @ts-ignore incorrect typings
                        <AreaListAreaCard key={area.id} area={area} teamId={teamArea.team?.id} />
                      ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </MapCard>
  );
};

export default AreaListControlPanel;
