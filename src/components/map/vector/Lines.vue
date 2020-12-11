<script lang="ts">
import {defineComponent, computed, onMounted, onUnmounted, watch} from "@vue/runtime-core";
import {Polyline, LayerGroup, Polygon} from 'leaflet';
import {useStore} from "@/store";
import {DynmapLine, DynmapMarkerSet} from "@/dynmap";
import {ActionTypes} from "@/store/action-types";
import {createLine, updateLine} from "@/util/lines";
import Util from '@/util';

export default defineComponent({
	props: {
		set: {
			type: Object as () => DynmapMarkerSet,
			required: true,
		},
		layerGroup: {
			type: Object as () => LayerGroup,
			required: true
		}
	},

	setup(props) {
		let updateFrame = 0;

		const store = useStore(),
			currentProjection = computed(() => store.state.currentProjection),
			pendingUpdates = computed(() => {
				const markerSetUpdates = store.state.pendingSetUpdates.get(props.set.id);

				return markerSetUpdates && markerSetUpdates.lineUpdates.length;
			}),
			layers = Object.freeze(new Map<string, Polyline | Polygon>()),

			createLines = () => {
				const converter = Util.getPointConverter();

				props.set.lines.forEach((line: DynmapLine, id: string) => {
					const layer = createLine(line, converter);

					layers.set(id, layer);
					props.layerGroup.addLayer(layer);
				});
			},

			deleteLine = (id: string) => {
				let line = layers.get(id) as Polyline;

				if (!line) {
					return;
				}

				line.remove();
				layers.delete(id);
			},

			handlePendingUpdates = () => {
				useStore().dispatch(ActionTypes.POP_LINE_UPDATES, {
					markerSet: props.set.id,
					amount: 10,
				}).then(updates => {
					const converter = Util.getPointConverter();

					for(const update of updates) {
						if(update.removed) {
							console.log(`Deleting line ${update.id}`);
							deleteLine(update.id);
						} else {
							console.log(`Updating/creating line ${update.id}`);
							const layer = updateLine(layers.get(update.id), update.payload as DynmapLine, converter)

							if(!layers.has(update.id)) {
								layers.set(update.id, layer);
								props.layerGroup.addLayer(layer);
							}
						}
					}

					if(pendingUpdates.value) {
						console.log('More updates left, scheduling frame');
						// eslint-disable-next-line no-unused-vars
						updateFrame = requestAnimationFrame(() => handlePendingUpdates());
					} else {
						updateFrame = 0;
					}
				});
			};

		//FIXME: Prevent unnecessary repositioning when changing worlds
		watch(currentProjection, () => {
			const converter = Util.getPointConverter();

			for (const [id, line] of props.set.lines) {
				updateLine(layers.get(id), line, converter);
			}
		});

		watch(pendingUpdates, (newValue, oldValue) => {
			if(newValue && newValue > 0 && oldValue === 0 && !updateFrame) {
				updateFrame = requestAnimationFrame(() => handlePendingUpdates());
			}
		});

		onMounted(() => createLines());
		onUnmounted(() => updateFrame && cancelAnimationFrame(updateFrame));
	},

	render() {
		return null;
	}
});
</script>