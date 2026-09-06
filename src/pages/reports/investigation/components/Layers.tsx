import OptionalWrapper from "components/extensive/OptionalWrapper";
import { FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Layer, Source } from "react-map-gl/mapbox";
import { useRouteMatch } from "react-router-dom";
import { TParams } from "../types";
import { allDeforestationAlerts, EAlertTypes } from "constants/alerts";

// Map Sources
import AreaAssignmentSource from "./AreaAssignmentSource";
import AreaAlertsSource from "./AreaAlertSource";
import AreaRoutesSource from "./AreaRoutesSource";

interface IProps {
  contextualLayerUrls: string[];
  lockAlertSelections: boolean;
  parentControl?: boolean;
}

// get the layer name from a tiles url, e.g. "https://.../layerName/latest/default/{z}/{x}/{y}.pbf" => "layerName"
function getLayerNameFromTilesUrl(raw: string): string | null {
  // Handles accidental wrapping quotes like "'https://...'"
  const cleaned = raw.trim().replace(/^['"]+|['"]+$/g, "");

  let url: URL;
  try {
    url = new URL(cleaned);
  } catch {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  // expected: [name, "latest", "default", "{z}", "{x}", "{y}.pbf"]
  return parts[1] === "latest" ? parts[0] : null;
}

const Layers: FC<IProps> = ({ contextualLayerUrls, lockAlertSelections, parentControl = false }) => {
  let investigationMatch = useRouteMatch<TParams>({ path: "/reporting/investigation/:areaId/start", exact: false });
  const { control } = useFormContext();
  const watcher = useWatch({ control });

  return (
    <OptionalWrapper data={!!investigationMatch}>
      {contextualLayerUrls.map(url => {
        const isVector = url.endsWith(".pbf");
        const sourceLayerFromUrl = getLayerNameFromTilesUrl(url);
        return isVector && sourceLayerFromUrl ? (
          <Source id={url} type="vector" tiles={[url]} key={url}>
            <Layer
              id={`${url}-layer`}
              type="fill"
              source-layer={sourceLayerFromUrl}
              paint={{
                "fill-color": "#3FBF7F",
                "fill-opacity": 0.5
              }}
            />
          </Source>
        ) : (
          <Source id={url} type="raster" tiles={[url]} key={url}>
            <Layer id={`${url}-layer`} type="raster" />
          </Source>
        );
      })}

      {watcher.showAlerts.includes("true") && (
        <AreaAlertsSource
          areaId={investigationMatch?.params.areaId}
          alertTypesToShow={watcher.alertTypesShown === "all" ? allDeforestationAlerts : [watcher.alertTypesShown]}
          alertRequestThreshold={
            watcher.alertTypesShown !== EAlertTypes.VIIRS
              ? watcher.alertTypesRequestThreshold
              : watcher.alertTypesViirsRequestThreshold
          }
          locked={lockAlertSelections}
        />
      )}

      {watcher.showOpenAssignments.includes("true") && (
        <AreaAssignmentSource areaId={investigationMatch?.params.areaId} parentControl={parentControl} />
      )}

      {watcher.showRoutes.includes("true") && (
        <AreaRoutesSource areaId={investigationMatch?.params.areaId} parentControl={parentControl} />
      )}
    </OptionalWrapper>
  );
};

export default Layers;
