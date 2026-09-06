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
function getLayerNameFromTilesUrl(tileUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(tileUrl);
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
        const cleanedUrl = url.trim().replace(/^['"]+|['"]+$/g, "");
        const isVector = cleanedUrl.endsWith(".pbf");
        const sourceLayerFromUrl = isVector ? getLayerNameFromTilesUrl(cleanedUrl) : null;

        // skip vector tiles where the source layer cannot be determined
        if (isVector && !sourceLayerFromUrl) return null;

        return isVector ? (
          <Source id={cleanedUrl} type="vector" tiles={[cleanedUrl]} key={cleanedUrl}>
            <Layer
              id={`${cleanedUrl}-layer`}
              type="fill"
              source-layer={sourceLayerFromUrl!}
              paint={{
                "fill-color": "#3FBF7F",
                "fill-opacity": 0.5
              }}
            />
          </Source>
        ) : (
          <Source id={cleanedUrl} type="raster" tiles={[cleanedUrl]} key={cleanedUrl}>
            <Layer id={`${cleanedUrl}-layer`} type="raster" />
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
