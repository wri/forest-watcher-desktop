import List from "components/extensive/List";
import { Layers } from "generated/clayers/clayersResponses";
import {
  useDeleteV3ContextualLayerLayerId,
  usePostContextualLayer,
  usePostV3ContextualLayerTeamTeamId
} from "generated/clayers/clayersComponents";
import LoadingWrapper from "components/extensive/LoadingWrapper";
import { FormattedMessage, useIntl } from "react-intl";
import HeaderCard from "components/ui/Card/HeaderCard";
import { TeamResponse } from "generated/core/coreResponses";
import OptionalWrapper from "components/extensive/OptionalWrapper";
import Button from "components/ui/Button/Button";
import { useAccessToken } from "hooks/useAccessToken";
import FormModal from "components/modals/FormModal";
import { useMemo, useState } from "react";
import { UnpackNestedValue } from "react-hook-form";
import yup from "configureYup";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { Option } from "types";
import { toastr } from "react-redux-toastr";
import { ILayersSection } from "./LayersSection";

type LayersCardProps = {
  title: string;
  titleIsKey?: boolean;
  items: Layers["data"];
  availableLayers?: Layers["data"];
  refetchLayers: () => void;
  layersLoading: boolean;
  team?: TeamResponse["data"];
  type?: ILayersSection["type"];
};

type TAssignLayersForm = {
  layers: string[];
};

const addLayersSchema = yup
  .object()
  .shape({
    layers: yup.array().max(3).required()
  })
  .required();

const LayersCard = ({
  title,
  items,
  availableLayers = [],
  refetchLayers,
  layersLoading,
  titleIsKey = true,
  team,
  type
}: LayersCardProps) => {
  const { httpAuthHeader } = useAccessToken();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const intl = useIntl();

  const canBeLoadable = items.some(item => !item.attributes?.isPublic);
  const loading = canBeLoadable ? layersLoading : false;
  const isTeam = !!team;
  const isUser = type === "USER";

  const isMyTeam = team?.attributes?.userRole === "administrator" || team?.attributes?.userRole === "manager";

  const { mutateAsync: addNewTeamLayer } = usePostV3ContextualLayerTeamTeamId();
  const { mutateAsync: deleteLayer } = useDeleteV3ContextualLayerLayerId();

  const { mutateAsync: addNewUserLayer } = usePostContextualLayer();

  const uniqueAvailableLayers = useMemo(() => {
    const seen = new Set<string>();
    return availableLayers.filter(layer => {
      const url = layer.attributes?.url || "";
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [availableLayers]);

  const layerOptions = useMemo<Option[] | undefined>(
    () =>
      uniqueAvailableLayers.map(layer => {
        const name = layer.attributes?.name || "";
        return {
          label: intl.formatMessage({ id: name, defaultMessage: name }),
          value: layer.attributes?.url || ""
        };
      }),
    [uniqueAvailableLayers, intl]
  );

  const hasAvailableLayers = uniqueAvailableLayers.length > 0;

  const selectedOptions = useMemo<string[]>(
    () => Array.from(new Set(items?.map(item => item.attributes?.url || "") ?? [])),
    [items]
  );

  const onModalSave = async (data: UnpackNestedValue<TAssignLayersForm>) => {
    try {
      toastr.success(intl.formatMessage({ id: "layers.success" }), "");
      const promises: Promise<any>[] = [];

      // Delete all..
      items.forEach(item => {
        promises.push(deleteLayer({ pathParams: { layerId: item.id }, headers: httpAuthHeader }));
      });

      await Promise.all(promises);

      if (isTeam) {
        await handleTeamUpdates(data);
      } else if (isUser) {
        await handleUserUpdates(data);
      }
      setIsModalOpen(false);
    } catch (e: any) {
      toastr.error(intl.formatMessage({ id: "layers.error" }), "");
      console.error(e);
    } finally {
      refetchLayers();
    }
  };

  const handleTeamUpdates = async (data: UnpackNestedValue<TAssignLayersForm>) => {
    // Find Layers
    const layers = data.layers.map(url => uniqueAvailableLayers.find(layer => layer.attributes?.url === url));

    for (let i = 0; i < layers.length; i++) {
      const item = layers[i];
      await addNewTeamLayer({
        body: {
          name: item?.attributes?.name || "",
          url: item?.attributes?.url || "",
          enabled: true
        },
        pathParams: { teamId: team?.id || "" },
        headers: httpAuthHeader
      });
    }
  };

  const handleUserUpdates = async (data: UnpackNestedValue<TAssignLayersForm>) => {
    // Find Layers
    const layers = data.layers.map(url => uniqueAvailableLayers.find(layer => layer.attributes?.url === url));

    for (let i = 0; i < layers.length; i++) {
      const item = layers[i];
      await addNewUserLayer({
        body: {
          name: item?.attributes?.name || "",
          url: item?.attributes?.url || "",
          enabled: true,
          isPublic: false
        },
        headers: httpAuthHeader
      });
    }
  };

  return (
    <>
      <HeaderCard className="mt-7" as="section">
        <HeaderCard.Header className="flex justify-between align-middle">
          <HeaderCard.HeaderText>{titleIsKey ? <FormattedMessage id={title} /> : title}</HeaderCard.HeaderText>
          <OptionalWrapper data={(isTeam && isMyTeam) || isUser}>
            <Button onClick={() => setIsModalOpen(true)} disabled={!hasAvailableLayers}>
              <FormattedMessage id="common.edit" />
            </Button>
          </OptionalWrapper>
        </HeaderCard.Header>
        <HeaderCard.Content className="pb-0">
          <LoadingWrapper loading={loading} className="py-10 relative">
            <OptionalWrapper
              data={items.length > 0}
              elseComponent={
                <p className="text-neutral-700 uppercase text-sm font-[500] mb-7">
                  <FormattedMessage id="layers.noLayers" />
                </p>
              }
            >
              <List
                items={items}
                itemClassName="text-neutral-700 uppercase text-sm font-[500] mb-7"
                render={item => {
                  const name = item.attributes?.name || "layers.none";
                  return <>{intl.formatMessage({ id: name, defaultMessage: name })}</>;
                }}
              />
            </OptionalWrapper>
          </LoadingWrapper>
        </HeaderCard.Content>
      </HeaderCard>
      <FormModal<TAssignLayersForm>
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onModalSave}
        modalTitle="layers.userLayers.edit"
        modalSubtitle="layers.userLayers.editSubtitle"
        submitBtnName="common.done"
        key={selectedOptions.length}
        useFormProps={{ resolver: yupResolver(addLayersSchema), defaultValues: { layers: selectedOptions } }}
        inputs={[
          {
            id: "select-templates",
            selectProps: {
              label: intl.formatMessage({ id: "layers.userLayers.subtitle" }),
              placeholder: intl.formatMessage({ id: "layers.userLayers.subtitle" }),
              options: layerOptions,
              defaultValue: []
            },
            hideLabel: true,
            isMultiple: true,
            registerProps: {
              name: "layers"
            },
            formatErrors: errors => errors.layers
          }
        ]}
      />
    </>
  );
};

export default LayersCard;
