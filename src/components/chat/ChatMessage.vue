<!--
  - Copyright 2020 James Lyne
  -
  -    Licensed under the Apache License, Version 2.0 (the "License");
  -    you may not use this file except in compliance with the License.
  -    You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  -    Unless required by applicable law or agreed to in writing, software
  -    distributed under the License is distributed on an "AS IS" BASIS,
  -    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  -    See the License for the specific language governing permissions and
  -    limitations under the License.
  -->

<template>
	<li :class="`message message--${message.type}`">
		<img v-if="showFace" width="16" height="16" class="message__face" :src="image" alt="" />
		<span v-if="showSender" class="message__sender" v-html="message.playerName"></span>
		<span class="message__content" v-html="messageContent"></span>
	</li>
</template>

<script lang="ts">
	import {defineComponent, ref, onMounted, computed} from "@vue/runtime-core";
	import {DynmapChat} from "@/dynmap";
	import Util from '@/util';
	import {useStore} from "@/store";

	const defaultImage = require('@/assets/images/player_face.png');

	export default defineComponent({
		props: {
			message: {
				type: Object as () => DynmapChat,
				required: true,
			}
		},
		setup(props) {
			const store = useStore();
			let image = ref(defaultImage),
				showFace = computed(() => store.state.components.chatBox?.showPlayerFaces && props.message.playerAccount),
				showSender = computed(() => props.message.playerName && props.message.type === 'chat'),
				messageContent = computed(() => {
					switch(props.message.type) {
						case 'chat':
							return props.message.message;
						case 'playerjoin':
							if(props.message.playerName) {
								return store.state.messages.playerJoin
									.replace('%playername%', props.message.playerName);
							} else {
								return store.state.messages.anonymousJoin;
							}
						case 'playerleave':
							if(props.message.playerName) {
								return store.state.messages.playerQuit
									.replace('%playername%', props.message.playerName);
							} else {
								return store.state.messages.anonymousQuit;
							}
					}
				})

			onMounted(() => {
				if(showFace.value) {
					Util.getMinecraftHead(props.message.playerAccount as string, '16')
						.then((result) => image.value = result.src).catch(() => {});
				}
			});

			return {
				image,
				showFace,
				showSender,
				messageContent
			}
		}
	})
</script>

<style lang="scss">
	.message {
		.message__face {
			display: inline-block;
			vertical-align: baseline;
			margin-right: 0.5rem;
		}

		.message__sender {
			margin-right: 0.5rem;
			word-wrap: break-word;

			&:not(:empty):after {
				content: ': ';
			}
		}

		.message__content {
			word-wrap: break-word;
		}

		&.message--playerjoin,
		&.message--playerleave {
			font-style: italic;
		}

		@media (max-width: 20rem) {
			&.message--chat {
				.message__sender:after {
					content: none;
				}

				.message__content {
					display: block;
					color: #eeeeee;
				}
			}
		}
	}
</style>