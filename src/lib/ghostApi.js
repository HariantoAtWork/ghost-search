const axiosBluebird = require('axiosbluebird')
const Promise = axiosBluebird.Promise

let retrievePostRequest = Promise.resolve()

let settings = {
	url: 'https://blog.ghost.localhost',
	key: 'c3426374501bcd41a801c5a74a',
	version: 'v3'
}

const ghostApi = {
	updateSettings: config => {
		settings = { ...settings, ...config }
	},
	posts: params => {
		const url = `${settings.url}/ghost/api/${settings.version}/content/posts/`
		params = {
			...{ key: settings.key, limit: 1000, include: 'tags,authors' },
			...params
		}
		retrievePostRequest.cancel()
		retrievePostRequest = axiosBluebird
			.get(url, params)
			.then(({ data, config }) => ({
				...data,
				$params: config.params
			}))
			.catch(console.error.bind(console, 'FAIL - posts'))
		return retrievePostRequest
	},
	nextChunkPosts: page =>
		ghostApi
			.posts({ page })
			.catch(console.error.bind(console, 'FAIL - nextChunkPosts'))
}

module.exports = ghostApi
