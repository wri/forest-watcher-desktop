// @ts-ignore missing types
import normalize from "json-api-normalizer";
import { layerService } from "services/layer";
import { AppDispatch, RootState } from "store";

// Actions
const SET_LAYERS = "layers/SET_LAYERS";
const SET_LOADING = "layers/SET_LOADING";
const DELETE_LAYERS = "layers/DELETE_LAYERS";
const SET_CARD_PORTAL = "layers/SET_CARD_PORTAL";

export interface ICartoLayer {
  cartodb_id: number;
  title: string;
  tileurl: string;
}

// Legacy code - used by old Layers code, added to fix TS errors
interface ILegacyLayer {
  id: string;
  attributes: any;
}

export type TLayersState = {
  selectedLayers: any;
  selectedLayerIds: string[];
  loading: boolean;
  portal: HTMLElement | undefined;
};

export type TReducerActions =
  | { type: typeof SET_LAYERS; payload: { selectedLayer: any } }
  | { type: typeof SET_LOADING; payload: boolean }
  | { type: typeof DELETE_LAYERS; payload: { layer: ILegacyLayer } }
  | { type: typeof SET_CARD_PORTAL; payload: { portal: HTMLElement | undefined } };

// Reducer
const initialState: TLayersState = {
  selectedLayers: {},
  selectedLayerIds: [],
  loading: false,
  portal: undefined
};

export default function reducer(state = initialState, action: TReducerActions): TLayersState {
  switch (action.type) {
    case SET_CARD_PORTAL: {
      if (action.payload) {
        return Object.assign({}, state, { portal: action.payload.portal });
      }
      return state;
    }
    case SET_LAYERS: {
      const selectedLayer = action.payload.selectedLayer;
      if (selectedLayer) {
        //@ts-ignore - TODO: Figure out typescript error
        if (state.selectedLayerIds.indexOf(...Object.keys(selectedLayer)) > -1) {
          return {
            ...state,
            selectedLayers: { ...state.selectedLayers, ...selectedLayer }
          };
        } else {
          return {
            ...state,
            selectedLayerIds: [...state.selectedLayerIds, ...Object.keys(selectedLayer)],
            selectedLayers: { ...state.selectedLayers, ...selectedLayer }
          };
        }
      }
      return state;
    }
    case DELETE_LAYERS: {
      const deletedLayer = action.payload.layer;
      if (deletedLayer) {
        const selectedLayers = Object.assign({}, state.selectedLayers);
        delete selectedLayers[deletedLayer.id];
        return {
          ...state,
          selectedLayerIds: state.selectedLayerIds.filter(id => id !== deletedLayer.id),
          selectedLayers
        };
      }
      return state;
    }
    case SET_LOADING: {
      return Object.assign({}, state, { loading: action.payload });
    }
    default:
      return state;
  }
}

// Action Creators

export function setPortalCard(portal: HTMLElement | undefined) {
  return (dispatch: AppDispatch) => {
    dispatch({
      type: SET_CARD_PORTAL,
      payload: { portal }
    });
  };
}

export function createLayer(layer: ICartoLayer, teamId: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: SET_LOADING,
      payload: true
    });

    layerService.token = getState().user.token;
    return layerService
      .createLayer(layer, teamId)
      .then(async data => {
        const normalized = normalize(data);
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        dispatch({
          type: SET_LAYERS,
          payload: { selectedLayer: normalized.contextualLayers }
        });
      })
      .catch(error => {
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        console.warn(error);
      });
  };
}

export function toggleLayer(layer: ILegacyLayer, value: boolean) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: SET_LOADING,
      payload: true
    });

    layerService.token = getState().user.token;
    return layerService
      .toggleLayer(layer.id, value)
      .then(async data => {
        const normalized = normalize(data);
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        dispatch({
          type: SET_LAYERS,
          payload: { selectedLayer: normalized.contextualLayers }
        });
      })
      .catch(error => {
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        console.warn(error);
      });
  };
}

export function deleteLayer(layer: ILegacyLayer) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: SET_LOADING,
      payload: true
    });

    layerService.token = getState().user.token;
    return layerService
      .deleteLayer(layer.id)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
      })
      .then(() => {
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        dispatch({
          type: DELETE_LAYERS,
          payload: { layer }
        });
      })
      .catch(error => {
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        console.warn(error);
      });
  };
}

export function getLayers() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: SET_LOADING,
      payload: true
    });

    layerService.token = getState().user.token;
    return layerService
      .getLayers()
      .then(async data => {
        const normalized = normalize(data);
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        dispatch({
          type: SET_LAYERS,
          payload: { selectedLayer: normalized.contextualLayers }
        });
      })
      .catch(error => {
        dispatch({
          type: SET_LOADING,
          payload: false
        });
        console.warn(error);
      });
  };
}
