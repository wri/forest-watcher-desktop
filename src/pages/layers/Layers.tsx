import { useAccessToken } from "hooks/useAccessToken";
import LayersSection, { ILayersSection } from "./components/LayersSection";
import { useGetV3ContextualLayer } from "../../generated/clayers/clayersComponents";
import { Layers as ILayers } from "../../generated/clayers/clayersResponses";
import LoadingWrapper from "components/extensive/LoadingWrapper";
import { useMemo } from "react";
import List from "components/extensive/List";
import Hero from "components/layouts/Hero/Hero";

const Layers = () => {
  const { httpAuthHeader } = useAccessToken();

  const {
    data: layersData,
    isLoading: layersLoading,
    isFetching: layersFetching,
    refetch: refetchLayers
  } = useGetV3ContextualLayer({ headers: httpAuthHeader });

  const layers: { pub?: ILayers["data"]; user?: ILayers["data"]; teams?: ILayers["data"] } = useMemo(() => {
    // Public layers that are disabled (isPublic: true, enabled: false) are not shown
    // in the public section; they are instead offered as selectable options in the
    // user/teams sections (see LayersCard).
    const pub = layersData?.data.filter(l => l.attributes && l.attributes.isPublic && l.attributes.enabled !== false);
    const teams = layersData?.data.filter(
      l => l.attributes && !l.attributes.isPublic && l.attributes.owner.type === "TEAM"
    );

    const user = layersData?.data.filter(
      l => l.attributes && !l.attributes.isPublic && l.attributes.owner.type === "USER"
    );

    return { pub, teams, user };
  }, [layersData]);

  const availableLayers = useMemo(() => layersData?.data ?? [], [layersData]);

  const sections = useMemo(
    () =>
      [
        {
          title: "layers.publicLayers.title",
          subtitle: "layers.publicLayers.subtitle",
          cardTitle: "layers.publicLayers.card.title",
          cardItems: layers.pub ?? [],
          type: "PUBLIC"
        },
        {
          title: "layers.userLayers.title",
          subtitle: "layers.userLayers.subtitle",
          cardTitle: "layers.userLayers.card.title",
          cardItems: layers.user ?? [],
          type: "USER"
        },
        {
          title: "layers.teamLayers.title",
          subtitle: "layers.teamLayers.subtitle",
          cardItems: layers.teams ?? [],
          type: "TEAMS",
          className: "bg-neutral-400"
        }
      ] as ILayersSection[],
    [layers]
  );

  return (
    <section className="relative">
      <Hero title={"settings.layers"} />
      <LoadingWrapper loading={layersLoading}>
        <List
          items={sections}
          render={item => (
            <LayersSection
              {...item}
              className="pt-15 pb-20"
              refetchLayers={refetchLayers}
              layersLoading={layersLoading || layersFetching}
              availableLayers={availableLayers}
            />
          )}
          itemClassName="even:bg-neutral-400"
        />
      </LoadingWrapper>
    </section>
  );
};

export default Layers;
