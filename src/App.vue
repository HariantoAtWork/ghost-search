<template>
	<div class="ghost-search panel" :class="{ 'panel--show': show }">
		<header class="ghost-search__header u-box">
			<div class="ghost-search-input u-flex u-box">
				<button
					class="ghost-search__button ghost-search-input__button"
					:title="lastBuildDate"
					@click="updateData"
				>
					<i class="fa fa-sync"></i>
				</button>
				<input
					v-model="query"
					class="ghost-search-input__input u-flex"
					type="search"
					placeholder="Search"
				/>
			</div>
			<div class="ghost-search-postsindicator">
				<span>{{ filteredPosts.length }}</span> /
				<span>{{ posts.length }}</span>
			</div>
			<button
				class="ghost-search__button ghost-search__button--toggle"
				:class="{'active': filters.tags.length}"
				@click="toggleTagsPanel"
			>
				<i
					class="ghost-search__button__icon fa"
					:class="{ 'fa-window-close-o': showTagsPanel, 'fa-filter': !showTagsPanel }"
				></i>
			</button>
			<button class="ghost-search__button ghost-search__button--toggle" @click="toggleScroll">
				<i
					class="ghost-search__button__icon fa"
					:class="{ 'fa-window-close': show, 'fa-search': !show }"
				></i>
			</button>
		</header>
		<section class="ghost-search__section">
			<GhostSearchPosts :post="post" v-for="post in filteredPosts" :key="post.id" />
		</section>
		<section v-if="showTagsPanel" class="ghost-search__filter-panel">
			<FilterGroupList
				title="Tags"
				:disabledTags="filters.tags"
				:availableTags="filteredTagsFromFilteredListBy('tags')"
				:onRemoveTagFrom="onRemoveFromFilterBy.bind(this, 'tags')"
				:onAddTagTo="onAddToFilterBy.bind(this, 'tags')"
			/>
		</section>
		<footer class="ghost-search__footer">
			<button class="ghost-search__button" @click="toggleScroll">
				<i
					class="ghost-search__button__icon fa"
					:class="{ 'fa-window-close': show, 'fa-search': !show }"
				></i>
			</button>
		</footer>
	</div>
</template>

<script>
import GhostSearchPosts from './components/GhostSearchPosts.vue'
import FilterGroupList from './components/FilterGroupList.vue'

const ghostApi = require('./lib/ghostApi'),
	getLastBuildDate = require('./lib/getLastBuildDate'),
	storageModel = require('./lib/storageModel')
const dayjs = require('dayjs'),
	uniqBy = require('lodash/uniqBy'),
	differenceBy = require('lodash/differenceBy')

window['storageModel'] = storageModel
export default {
	name: 'App',
	components: {
		GhostSearchPosts,
		FilterGroupList
	},
	props: {
		url: {
			type: String,
			required: true,
			default: 'https://blog.ghost.localhost'
		},
		ghostKey: {
			type: String,
			required: true,
			default: 'c3426374501bcd41a801c5a74a'
		},
		version: {
			type: String,
			default: 'v3'
		}
	},
	data: () => ({
		show: false,
		query: '',
		lastBuildDate: '',
		posts: [],
		showTagsPanel: false,
		filters: {
			tags: []
		}
	}),
	computed: {
		sortedPostByPublishedAt() {
			return [...this.posts].sort((a, b) => {
				const diff = dayjs(a.published_at).diff(dayjs(b.published_at))
				if (diff > 0) return -1
				if (diff < 0) return 1
				return 0
			})
		},
		filteredPosts() {
			const queryElements = Object.values(this.filters).reduce(
					(acc, collection) => [...acc, ...collection],
					[]
				),
				list = this.sortedPostByPublishedAt,
				query = this.query.trim().toLowerCase()

			return query.length || queryElements.length
				? list.filter(item => {
						const { title, excerpt, custom_excerpt, plaintext } = item
						const attrs = [title, excerpt, custom_excerpt, plaintext]

						return (
							attrs.reduce(
								(acc, attr) =>
									acc +
									Boolean(
										attr &&
											String(attr)
												.toLowerCase()
												.includes(query)
									),
								false
							) &&
							queryElements.reduce(
								(acc, element) =>
									acc * Boolean(item.tags.find(tag => tag.id === element.id)),
								true
							)
						)
				  })
				: list
		},
		uniqueTagsFromPosts() {
			return uniqBy(
				this.posts.reduce((acc, item) => [...acc, ...item.tags], []),
				'id'
			)
		},
		uniqueTagsFromFilteredPosts() {
			return uniqBy(
				this.filteredPosts.reduce((acc, item) => [...acc, ...item.tags], []),
				'id'
			)
		}
	},
	watch: {
		query(value) {
			storageModel.query = value
		},
		lastBuildDate(value) {
			storageModel.lastBuildDate = value
		},
		posts(value) {
			storageModel.posts = value
		},
		show(value) {
			console.log('show:', { value })
			this.disableScrollRootDom(value)
		}
	},
	methods: {
		filteredTagsBy(prop) {
			return differenceBy(this.uniqueTagsFromPosts, this.filters[prop], 'id')
		},
		filteredTagsFromFilteredListBy(prop) {
			return this.filteredTagsBy(prop).filter(item =>
				this.uniqueTagsFromFilteredPosts.find(tag => tag.id === item.id)
			)
		},
		toggleScroll() {
			this.show = !this.show
		},
		assignPosts(data) {
			const { meta, posts, $params } = data
			const { next, limit } = meta.pagination
			this.posts.push(...posts)
			if (next) {
				return ghostApi.posts({ ...$params, page: next }).then(this.assignPosts)
			} else {
				return data
			}
		},
		updateData() {
			console.log('updateData')
			this.posts = []
			const lastBuildDate = getLastBuildDate(`${this.url}/rss/`)
			const posts = ghostApi.posts()
			Promise.all([lastBuildDate, posts])
				.then(values => {
					const [lastBuildDate, data] = values
					this.lastBuildDate = lastBuildDate
					return data
				})
				.then(data => this.assignPosts(data))
		},
		disableScrollRootDom(enable) {
			const doc = document.querySelector(':root')
			if (enable) {
				doc.classList.add('hide-scroll')
			} else {
				doc.classList.remove('hide-scroll')
			}
		},
		activatePanel(bool) {
			this.disableScrollRootDom(bool)
			this.show = bool
		},
		toggleTagsPanel() {
			this.showTagsPanel = !this.showTagsPanel
		},
		// Events
		onAddToFilterBy(prop, value) {
			const list = this.filters[prop]
			const foundIndex = list.indexOf(value)
			if (!(foundIndex > -1)) {
				list.push(value)
			}
		},
		onRemoveFromFilterBy(prop, value) {
			const list = this.filters[prop]
			let foundIndex = list.indexOf(value)
			if (foundIndex > -1) {
				list.splice(foundIndex, 1)
			}
		}
	},
	// LifeCycle Hooks
	created() {
		const { url, ghostKey } = this
		this.query = storageModel.query
		ghostApi.updateSettings({ url, key: ghostKey })
		Promise.all([
			storageModel.lastBuildDate,
			storageModel.posts,
			getLastBuildDate(`${this.url}/rss/`)
		])
			.then(values => {
				const [lastBuildDate, posts] = values
				this.lastBuildDate = lastBuildDate
				this.posts = posts
				return values
			})
			.then(values => {
				const [lastBuildDate, posts, rssBuildDate] = values
				// When there is no Posts, the Storage Date aren’t valid, When there is time difference
				if (
					!posts.length ||
					!dayjs(lastBuildDate).isValid() ||
					dayjs(lastBuildDate).diff(dayjs(rssBuildDate)) < 0
				) {
					this.updateData()
				}
				return values
			})
			.catch(() => {
				this.updateData()
			})
	}
}
</script>
<style lang="scss">
::-webkit-scrollbar {
	width: 8px;
	height: 8px;
	background-color: #f5f5f5;
	box-sizing: border-box;

	&-track {
		background-color: #424a58;
	}

	&-thumb {
		background-color: #98a7b7;
		border-radius: 4px;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.8);

		&:hover {
			background-color: #1fc8db;
		}

		&:active {
			background-color: #0fb8ad;
		}
	}
}
.hide-scroll {
	overflow: hidden;
	height: 100vh;
	&::-webkit-scrollbar {
		display: none;
		scrollbar-width: none;
	}
}

.ghost-search {
	.u-relative {
		position: relative;
	}
	.u-box {
		display: flex;
	}
	.u-flex {
		flex: 1;
	}

	@media screen and (-webkit-min-device-pixel-ratio: 0) {
		select,
		textarea,
		input {
			font-size: 16px;

			&:focus {
				font-size: 16px;
			}
		}
	}
}
</style>
<style lang="scss" scoped>
.ghost-search {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	// width: 100vw;
	// height: 100vh;
	z-index: 1000;
	// overflow-y: visible;
	font-family: 'proxima-nova-1', sans-serif;

	color: white;
	padding-bottom: 40px;
	background-color: #2f2f2f;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 28' width='56' height='28'%3E%3Cpath fill='%23000000' fill-opacity='0.4' d='M56 26v2h-7.75c2.3-1.27 4.94-2 7.75-2zm-26 2a2 2 0 1 0-4 0h-4.09A25.98 25.98 0 0 0 0 16v-2c.67 0 1.34.02 2 .07V14a2 2 0 0 0-2-2v-2a4 4 0 0 1 3.98 3.6 28.09 28.09 0 0 1 2.8-3.86A8 8 0 0 0 0 6V4a9.99 9.99 0 0 1 8.17 4.23c.94-.95 1.96-1.83 3.03-2.63A13.98 13.98 0 0 0 0 0h7.75c2 1.1 3.73 2.63 5.1 4.45 1.12-.72 2.3-1.37 3.53-1.93A20.1 20.1 0 0 0 14.28 0h2.7c.45.56.88 1.14 1.29 1.74 1.3-.48 2.63-.87 4-1.15-.11-.2-.23-.4-.36-.59H26v.07a28.4 28.4 0 0 1 4 0V0h4.09l-.37.59c1.38.28 2.72.67 4.01 1.15.4-.6.84-1.18 1.3-1.74h2.69a20.1 20.1 0 0 0-2.1 2.52c1.23.56 2.41 1.2 3.54 1.93A16.08 16.08 0 0 1 48.25 0H56c-4.58 0-8.65 2.2-11.2 5.6 1.07.8 2.09 1.68 3.03 2.63A9.99 9.99 0 0 1 56 4v2a8 8 0 0 0-6.77 3.74c1.03 1.2 1.97 2.5 2.79 3.86A4 4 0 0 1 56 10v2a2 2 0 0 0-2 2.07 28.4 28.4 0 0 1 2-.07v2c-9.2 0-17.3 4.78-21.91 12H30zM7.75 28H0v-2c2.81 0 5.46.73 7.75 2zM56 20v2c-5.6 0-10.65 2.3-14.28 6h-2.7c4.04-4.89 10.15-8 16.98-8zm-39.03 8h-2.69C10.65 24.3 5.6 22 0 22v-2c6.83 0 12.94 3.11 16.97 8zm15.01-.4a28.09 28.09 0 0 1 2.8-3.86 8 8 0 0 0-13.55 0c1.03 1.2 1.97 2.5 2.79 3.86a4 4 0 0 1 7.96 0zm14.29-11.86c1.3-.48 2.63-.87 4-1.15a25.99 25.99 0 0 0-44.55 0c1.38.28 2.72.67 4.01 1.15a21.98 21.98 0 0 1 36.54 0zm-5.43 2.71c1.13-.72 2.3-1.37 3.54-1.93a19.98 19.98 0 0 0-32.76 0c1.23.56 2.41 1.2 3.54 1.93a15.98 15.98 0 0 1 25.68 0zm-4.67 3.78c.94-.95 1.96-1.83 3.03-2.63a13.98 13.98 0 0 0-22.4 0c1.07.8 2.09 1.68 3.03 2.63a9.99 9.99 0 0 1 16.34 0z'%3E%3C/path%3E%3C/svg%3E"),
		linear-gradient(to top, #30cfd0 0, #330867 70%, #000 100%);

	@media screen and (-webkit-min-device-pixel-ratio: 0) {
		/* Webkit-specific CSS here (Chrome and Safari) */

		&.panel {
			transition: all 0.6s;
			transform: translateX(-100%);

			&--show {
				transform: unset;
			}
		}
	}

	// .ghost-search .ghost-search__header
	.ghost-search &__header {
		z-index: 1;
		position: inherit;
		bottom: 0;
		left: 0;
		right: 0;
		height: 40px;
		background-color: grey;
		display: flex;

		> .ghost-search__button {
			&.active {
				background-color: #1fc8db;
			}
		}
	}

	// Button
	.ghost-search__button {
		background-color: black;
		color: white;
		width: 40px;
		height: 40px;
		margin: 0;
		padding: 0;
		border: 0;
	}
	.ghost-search__button--toggle {
		visibility: visible;
		padding: 0;
		margin: 0;

		// :not(.ghost-search--hide-scroll) & {
		// 	position: relative;
		// 	bottom: 40px;
		// 	right: -40px - 15px;
		// }

		// // When Panel are Shown
		// .ghost-search--hide-scroll & {
		// 	position: static;
		// 	bottom: unset;
		// 	// right: 0 + 15px;
		// }
	}
	// Input
	.ghost-search-input__input {
		height: 40px;
		border: 0;
		color: black;
		margin: 0;
		padding: 0 8px;
	}

	.ghost-search &__section {
		position: fixed;
		top: 0;
		bottom: 40px;
		left: 0;
		right: 0;
		overflow-x: hidden;
		overflow-y: auto;
		// padding-bottom: 40px;
	}
	.ghost-search &__footer {
		position: fixed;
		bottom: 0;
		right: 0;

		> .ghost-search__button {
			position: absolute;
			bottom: 40px;
			right: -40px;
			border-radius: 0 8px 8px 0;
			border-left: 4px solid #1fc8db;
			box-shadow: 0 0 2px rgba(255, 255, 255, 0.6), 0 1px 0 #1fc8db;
			cursor: pointer;
		}
	}

	.ghost-search &__filter-panel {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 40px;
		overflow-y: auto;
		overflow-x: hidden;
		width: calc(100% - 40px);
		max-width: 540px;
		background-color: rgba(0, 0, 0, 0.897);
		padding: 8px;
		box-sizing: border-box;

		.filter-panel__list {
			list-style: none;
			margin-top: unset;
			padding-left: unset;
		}
	}

	.ghost-search-postsindicator {
		position: absolute;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 4px;
		background-color: grey;
		font-size: 12px;
		line-height: 1em;
		padding: 4px 8px;
		box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.5);
	}
}
</style>
