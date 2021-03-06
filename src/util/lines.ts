/*
 * Copyright 2020 James Lyne
 *
 * Some portions of this file were taken from https://github.com/webbukkit/dynmap.
 * These portions are Copyright 2020 Dynmap Contributors.
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import {DynmapLine} from "@/dynmap";
import {LatLngExpression} from "leaflet";
import DynmapPolyline from "@/leaflet/vector/DynmapPolyline";

export const createLine = (options: DynmapLine, converter: Function): DynmapPolyline => {
	const points = getLinePoints(options, converter),
		line = new DynmapPolyline(points, {
			...options.style,
			minZoom: options.minZoom,
			maxZoom: options.maxZoom,
		});

	if(options.label) {
		line.bindPopup(() => createPopup(options));
	}

	return line;
};

export const updateLine = (line: DynmapPolyline | undefined, options: DynmapLine, converter: Function): DynmapPolyline => {
	const points = getLinePoints(options, converter);

	if (!line) {
		return createLine(options, converter);
	}

	line.unbindPopup();
	line.bindPopup(() => createPopup(options));
	line.setStyle(options.style);
	line.setLatLngs(points);
	line.redraw();

	return line;
}

export const createPopup = (options: DynmapLine) => {
	const popup = document.createElement('span');

	if (options.popupContent) {
		popup.classList.add('LinePopup');
		popup.insertAdjacentHTML('afterbegin', options.popupContent);
	} else if (options.isHTML) {
		popup.classList.add('LinePopup');
		popup.insertAdjacentHTML('afterbegin', options.label);
	} else {
		popup.textContent = options.label;
	}

	return popup;
}

export const getLinePoints = (options: DynmapLine, converter: Function): LatLngExpression[] => {
	const points = [];

	for(let i = 0; i < options.x.length; i++) {
		points.push(converter(options.x[i], options.y[i], options.z[i]));
	}

	return points;
};
