<template>
	<div class="ghost-search">
		<header class="ghost-search__header">
			<div class="ghost-search-input">
				<input
					class="ghost-search-input__input-field"
					type="search"
					v-model="query"
				/>
				<button
					class="ghost-search-input__button"
					:title="lastBuildDate"
					@click="updateData"
				>
					Refresh
				</button>
			</div>
		</header>
		<section class="ghost-section__main">
			<div
				class="ghost-search-posts"
				v-for="post in filteredPosts"
				:key="post.id"
			>
				<h1 class="ghost-search-posts__title">{{ post.title }}</h1>
				<p class="ghost-search-posts__excerpt">
					{{ post.custom_excerpt || post.excerpt }}
				</p>
			</div>
		</section>
		<div class="ghost-section__footer"></div>
	</div>
</template>

<script>
const ghostApi = require('./lib/ghostApi')
const getLastBuildDate = require('./lib/getLastBuildDate')
const storageModel = require('./lib/storageModel')
const dayjs = require('dayjs')
window['storageModel'] = storageModel
export default {
	name: 'App',
	components: {},
	props: {
		'script': {
			type: String,
			default:
				'https://unpkg.com/@tryghost/content-api@1.3.9/umd/content-api.min.js'
		},
		'url': {
			type: String,
			required: true,
			default: 'https://blog.ghost.localhost'
		},
		'ghostKey': {
			type: String,
			required: true,
			default: 'c3426374501bcd41a801c5a74a'
		},
		'version': {
			type: String,
			default: 'v3'
		}
	},
	data: () => ({
		query: '',
		lastBuildDate: '',
		posts: []
	}),
	computed: {
		filteredPosts() {
			return this.query.trim().length > 0
				? this.posts.filter(post =>
						Object.values(post)
							.toString()
							.toLowerCase()
							.includes(this.query.trim().toLowerCase())
				  )
				: this.posts
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
		}
	},
	methods: {
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
		}
	},
	created() {
		const { url, ghostKey } = this
		this.query = storageModel.query
		ghostApi.updateSettings({ url, key: ghostKey })
		Promise.all([storageModel.lastBuildDate, storageModel.posts])
			.then(values => {
				const [lastBuildDate, posts] = values
				this.lastBuildDate = lastBuildDate
				this.posts = posts
				return values
			})
			.then(values => {
				const [lastBuildDate, posts] = values
				if (!posts.length) {
					this.updateData()
				} else if (dayjs(lastBuildDate).isValid()) {
					getLastBuildDate(`${this.url}/rss/`).then(rssBuildDate => {
						const diff = dayjs(lastBuildDate).diff(dayjs(rssBuildDate))
						if (diff > 0) {
							this.updateData()
						}
					})
				} else {
					this.updateData()
				}
				return values
			})
	}
}
</script>

<style lang="scss">
.ghost-search {
}
</style>
