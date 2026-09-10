import type { Coordinates } from './useGeolocation';

export type LocationStatus = 'idle' | 'locating' | 'success' | 'error';

export interface RoomSetupLocationState {
  cityId: string;
  district: string;
  coordinates: Coordinates | null;
  status: LocationStatus;
}

export type RoomSetupLocationAction =
  | { type: 'locate' }
  | { type: 'located'; coordinates: Coordinates }
  | { type: 'locationFailed' }
  | { type: 'selectCity'; cityId: string }
  | { type: 'selectDistrict'; district: string }
  | { type: 'clearLocation' };

export const initialRoomSetupLocation: RoomSetupLocationState = {
  cityId: 'jeddah',
  district: '',
  coordinates: null,
  status: 'idle',
};

export function roomSetupLocationReducer(
  state: RoomSetupLocationState,
  action: RoomSetupLocationAction,
): RoomSetupLocationState {
  switch (action.type) {
    case 'locate':
      return { ...state, status: 'locating' };
    case 'located':
      return { ...state, district: '', coordinates: action.coordinates, status: 'success' };
    case 'locationFailed':
      return { ...state, coordinates: null, status: 'error' };
    case 'selectCity':
      return action.cityId === state.cityId
        ? state
        : { cityId: action.cityId, district: '', coordinates: null, status: 'idle' };
    case 'selectDistrict':
      return action.district
        ? { ...state, district: action.district, coordinates: null, status: 'idle' }
        : { ...state, district: '' };
    case 'clearLocation':
      return { ...state, coordinates: null, status: 'idle' };
  }

  return state;
}

export function getRoomLocationInput(state: RoomSetupLocationState) {
  return {
    neighborhood: state.district.trim() || undefined,
    latitude: state.coordinates?.lat,
    longitude: state.coordinates?.lng,
  };
}
