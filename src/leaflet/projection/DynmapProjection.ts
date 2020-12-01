import L from 'leaflet';
import {Coordinate} from "@/dynmap";

export interface DynmapProjectionOptions {}

export interface DynmapProjection {
	locationToLatLng(location: Coordinate): L.LatLng;
	latLngToLocation(latLng: L.LatLng, y: number): Coordinate;
}

export class DynmapProjection extends L.Class {

	constructor(options?: DynmapProjectionOptions) {
		super();
		L.Util.setOptions(this, options);
	}

	locationToLatLng(location: Coordinate): L.LatLng {
		return new L.LatLng(location.x, location.z);
	}

	latLngToLocation(latLng: L.LatLng, y: number): Coordinate {
		return {x: latLng.lat, y, z: latLng.lng};
	}
}
