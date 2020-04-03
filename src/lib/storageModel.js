const IndexedDBPromise = require('./IndexedDBPromise')
const biscuit = new IndexedDBPromise('ghostDb', 'biscuit')
const posts = new IndexedDBPromise('ghostDb', 'posts')
const storageModel = {
	get query() {
		return window.localStorage.getItem('query') || ''
	},
	set query(value) {
		window.localStorage.setItem('query', value)
	},
	get lastBuildDate() {
		return (async () => {
			try {
				const { value } = await biscuit.get('lastBuildDate')
				return value
			} catch (e) {
				return
			}
		})()
	},
	set lastBuildDate(value) {
		;(async () => {
			return await biscuit.put({ id: 'lastBuildDate', value })
		})()
	},
	get posts() {
		return (async () => await posts.getAll().catch(() => []))()
	},
	set posts(value) {
		if (Array.isArray(value) && !value.length) {
			;(async () => await posts.clear())()
		} else {
			;(async () => await posts.put(value))()
		}
	}
}

module.exports = storageModel
