<template>
	<div class="ghost-search">
		<div class="ghost-search-input">
			<input type="search" v-model="query" />
		</div>
		<div class="ghost-search-posts" v-for="post in posts" :key="post.id">
			<h1>{{ post.title }}</h1>
			<p>{{ post.custom_excerpt || post.excerpt }}</p>
		</div>
	</div>
</template>

<script>
const ghostApi = require('./lib/ghostApi')
const getLastBuildDate = require('./lib/getLastBuildDate')
const loadScript = require('./lib/loadScript')

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
	filters: {
		stringify: value => JSON.stringify(value, null, '\t')
	},
	methods: {
		assignPosts(data) {
			console.log('hi', Object.keys(data))
			const { meta, posts } = data
			const next = meta.pagination.next
			this.posts.push(...posts)
			if (next) {
				return ghostApi.nextChunkPosts(next).then(this.assignPosts)
			} else {
				return data
			}
		},
		updateData() {
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
		ghostApi.updateSettings({ url, key: ghostKey })
		this.updateData()
	}
}
</script>

<style lang="scss">
.ghost-search {
}
</style>
