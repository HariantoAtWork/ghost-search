const axiosBluebird = require('axiosbluebird')
const Promise = axiosBluebird.Promise

// const GhostApi = function(config) {
// 	const defaultConfig = {
// 		url: 'https://blog.ghost.localhost',
// 		key: 'c3426374501bcd41a801c5a74a',
// 		version: 'v3'
// 	}
// 	let settings = { ...defaultConfig, ...config }
// 	let retrievePostRequest = Promise.resolve()

// 	this.updateSettings = config => {
// 		settings = { ...settings, ...config }
// 	}

// 	this.posts = params => {
// 		const url = `${settings.url}/ghost/api/${settings.version}/content/posts/`
// 		params = {
// 			...{ key: settings.key, limit: 1000, include: 'tags,authors' },
// 			...params
// 		}
// 		retrievePostRequest.cancel()
// 		retrievePostRequest = axiosBluebird
// 			.get(url, params)
// 			.then(({ data }) => data)
// 			.catch(console.error.bind(console, 'FAIL - posts'))
// 		return retrievePostRequest
// 	}

// 	this.nextChunkPosts = page =>
// 		this.posts({ page }).catch(
// 			console.error.bind(console, 'FAIL - nextChunkPosts')
// 		)
// }
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
			.then(({ data }) => data)
			.catch(console.error.bind(console, 'FAIL - posts'))
		return retrievePostRequest
	},
	nextChunkPosts: page =>
		ghostApi
			.posts({ page })
			.catch(console.error.bind(console, 'FAIL - nextChunkPosts'))
}

module.exports = ghostApi
