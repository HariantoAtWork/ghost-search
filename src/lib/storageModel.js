const IndexedDBPromise = require('./IndexedDBPromise')
const biscuit = new IndexedDBPromise('ghostDb', 'biscuit')
const posts = new IndexedDBPromise('ghostDb', 'posts')
const storageModel = {
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
		return (async () => {
			return await posts.getAll().catch(() => [])
		})()
	},
	set posts(value) {
		;(async () => {
			return await posts.put(value)
		})()
	}
}

module.exports = storageModel
