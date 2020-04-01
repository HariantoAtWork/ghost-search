<template>
	<div class="ghost-search">
		<input type="search" v-model="search" />
		<div
			class="ghost-search-posts"
			v-for="post in filteredPosts"
			:key="post.id"
		>
			<h1>{{ post.title }}</h1>
			<p>{{ post.custom_excerpt || post.excerpt }}</p>
		</div>
	</div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
const lastBuildDate = require('./lib/lastBuildDate')
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
		search: '',
		posts: []
	}),
	computed: {
		filteredPosts() {
			return this.search.trim().length > 2
				? this.posts.filter(post =>
						Object.values(post)
							.toString()
							.toLowerCase()
							.includes(this.search.trim().toLowerCase())
				  )
				: this.posts
		}
	},
	filters: {
		stringify: value => JSON.stringify(value, null, '\t')
	},
	methods: {
		searchInKeys: object => {
			const foundKeys = []
			const keys = ['title', 'html', 'custom_excerpt', 'excerpt']

			keys.forEach(key => {
				if (object[key]) foundKeys.push(object[key].toLowerCase())
			})
			return foundKeys
		}
	},
	created() {
		loadScript(this.script)
			.then(() => {
				const { url, ghostKey, version } = this
				const api = (window['api'] = new window.GhostContentAPI({
					url,
					key: ghostKey,
					version
				}))
				return api
			})
			.then(api => api.posts.browse({ limit: 'all', include: 'tags,authors' }))
			.then((posts, meta) => (this.posts = posts))

		lastBuildDate('http://blog.ghost.localhost/rss/').then(
			console.log.bind(console)
		)
		console.log('url:', this.url)
	}
}
</script>

<style lang="scss">
.ghost-search {
}
</style>
