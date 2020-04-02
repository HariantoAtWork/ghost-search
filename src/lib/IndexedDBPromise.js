const IndexedDBPromise = function(databaseName, tableName, options) {
	var indexedDB =
			window.indexedDB ||
			window.mozIndexedDB ||
			window.webkitIndexedDB ||
			window.msIndexedDB,
		IDBTransaction = window.IDBTransaction ||
			window.webkitIDBTransaction ||
			window.msIDBTransaction || { READ_WRITE: 'readwrite' }, // This line should only be needed if it is needed to support the object's constants for older browsers
		IDBKeyRange =
			window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

	const log = function() {
		if (options && options.hasOwnProperty('debug') && options.debug) {
			console.log.apply(console, arguments)
		}
	}

	const error = function() {
		if (options && options.hasOwnProperty('debug') && options.debug) {
			console.error.apply(console, arguments)
		}
	}

	const openDB = databaseName =>
		new Promise((resolve, reject) => {
			const request = indexedDB.open(databaseName)
			log('openDB:', databaseName)
			request.onsuccess = event => {
				const db = event.target.result
				resolve({ db })
			}
			request.onerror = reject
			request.onclose = log.bind(console, `${databaseName} closed:`)
		})

	const upgradeDatabaseOnNewObjectStore = (tableName, { db }) =>
		new Promise((resolve, reject) => {
			if (!db.objectStoreNames.contains(tableName)) {
				log('upgradeDatabaseOnNewObjectStore', `'${tableName}'`, 'creating')
				const version = +db.version
				const databaseName = db.name
				db.close()
				const nextRequest = indexedDB.open(databaseName, version + 1)
				nextRequest.onupgradeneeded = nextEvent => {
					const database = nextEvent.target.result
					database.createObjectStore(tableName, {
						keyPath: 'id',
						autoIncrement: true
					})
				}
				nextRequest.onsuccess = nextEvent => {
					log('upgradeDatabaseOnNewObjectStore', `'${tableName}'`, 'onsuccess')
					const db = nextEvent.target.result
					resolve({ db, tableName })
				}
				nextRequest.onerror = error.bind(
					console,
					'upgradeDatabaseOnNewObjectStore'
				)
			} else {
				log(
					'upgradeDatabaseOnNewObjectStore',
					`'${tableName}'`,
					'already exist'
				)
				resolve({ db, tableName })
			}
		})

	const openTransaction = (mode, { tableName, db }) =>
		new Promise((resolve, reject) => {
			log({ mode, tableName, db })
			const tx = db.transaction(db.objectStoreNames, mode)
			const store = tx.objectStore(tableName)
			resolve({ store, tx, db })
			tx.oncomplete = log.bind(console, 'tx: oncomplete', tableName)
			tx.onerror = log.error(console, 'tx: onerror', tableName)
		})

	const putDataToStore = ({ store, data }) =>
		new Promise((resolve, reject) => {
			const request = store.put(data)
			request.onsuccess = event => resolve(event.target.result)
			request.onerror = error => reject(error)
		})

	const putKeyToStore = ({ store, data }) =>
		new Promise((resolve, reject) => {
			const { prop, value } = data
			console.log('--- putKeyToStore:', { data })
			const request = store.put(prop, value)
			request.onsuccess = event => resolve(event.target.result)
			request.onerror = error => reject(error)
		})

	const clear = ({ store, tx, db }) =>
		new Promise((resolve, reject) => {
			log({ store, tx })
			tx.onsuccess = log.bind(console, `clear`)
			const request = store.clear()
			request.onsuccess = event => resolve(event.target.result)
			request.onerror = reject
		})
	const put = (data, { store, tx, db }) =>
		new Promise((resolve, reject) => {
			log({ data, store, tx })
			if (Array.isArray(data)) {
				const promises = []
				data.forEach(item => {
					promises.push(putDataToStore({ store, data: item }))
				})
				tx.onsuccess = log.bind(console, 'put Array')
				resolve(
					Promise.all(promises).then(result => {
						db.close()
						return result
					})
				)
			} else if (data && !Array.isArray(data) && typeof data === 'object') {
				tx.onsuccess = log.bind(console, 'put Object')
				resolve(
					putDataToStore({ store, data }).then(result => {
						db.close()
						return result
					})
				)
			} else {
				reject('put: No empty data! <string, number, array>')
			}
		})

	const getDataFromStoreById = ({ store, id }) =>
		new Promise((resolve, reject) => {
			const request = store.get(id)
			request.onsuccess = event => resolve(event.target.result)
			request.onerror = error => reject(error)
		})

	const get = (id, { store, tx, db }) =>
		new Promise((resolve, reject) => {
			if (Array.isArray(id)) {
				const promises = []
				id.forEach(item => {
					promises.push(getDataFromStoreById({ store, id: item }))
				})
				tx.onsuccess = log.bind(console, 'get Array')
				resolve(
					Promise.all(promises).then(result => {
						db.close()
						return result
					})
				)
			} else if (id && !Array.isArray(id) && typeof id === 'object') {
				reject('get: No object data! <string, number, array>')
			} else {
				tx.onsuccess = log.bind(console, 'get Object')
				resolve(
					getDataFromStoreById({ store, id }).then(result => {
						db.close()
						return result
					})
				)
			}
		})

	const getAll = ({ query, count }, { store, tx, db }) =>
		new Promise((resolve, reject) => {
			let result
			if (query != undefined && count != undefined) {
				log({ count })
				result = store.getAll(query, count)
			} else if (query != undefined) {
				log({ query })
				result = store.getAll(query)
			} else {
				result = store.getAll()
			}
			result.onsuccess = event => {
				db.close()
				resolve(event.target.result)
			}
			result.onerror = error => {
				db.close()
				reject(error)
			}
		})

	const removeDataFromStoreById = ({ store, id }) =>
		new Promise((resolve, reject) => {
			const request = store.delete(id)
			request.onsuccess = event => resolve(event.target.result)
			request.onerror = error => reject(error)
		})

	const remove = (id, { store, tx, db }) =>
		new Promise((resolve, reject) => {
			if (Array.isArray(id)) {
				const promises = []
				id.forEach(item => {
					promises.push(removeDataFromStoreById({ store, id: item }))
				})
				tx.onsuccess = log.bind(console, 'remove Array')
				resolve(
					Promise.all(promises).then(result => {
						db.close()
						return result
					})
				)
			} else if (id && !Array.isArray(id) && typeof id === 'object') {
				reject('remove: No object data! <string, number, array>')
			} else {
				tx.onsuccess = log.bind(console, 'remove Object')
				resolve(
					removeDataFromStoreById({ store, id }).then(result => {
						db.close()
						return result
					})
				)
			}
		})

	const deleteDatabase = databaseName =>
		new Promise((resolve, reject) => {
			const request = indexedDB.deleteDatabase(databaseName)
			request.onerror = reject
			request.onsuccess = event => {
				log(`${databaseName} is deleted successfully`)
				resolve(event.result)
			}
		})

	const readonlyTransaction = (databaseName, tableName) =>
		openDB(databaseName)
			.then(
				upgradeDatabaseOnNewObjectStore.bind(
					upgradeDatabaseOnNewObjectStore,
					tableName
				)
			)
			.catch(
				upgradeDatabaseOnNewObjectStore.bind(
					upgradeDatabaseOnNewObjectStore,
					tableName
				)
			)
			.then(openTransaction.bind(openTransaction, 'readonly'))

	const readwriteTransaction = (databaseName, tableName) =>
		openDB(databaseName)
			.then(
				upgradeDatabaseOnNewObjectStore.bind(
					upgradeDatabaseOnNewObjectStore,
					tableName
				)
			)
			.catch(
				upgradeDatabaseOnNewObjectStore.bind(
					upgradeDatabaseOnNewObjectStore,
					tableName
				)
			) // improved works, but need to refactor
			.then(openTransaction.bind(openTransaction, 'readwrite'))

	this.clear = () =>
		readwriteTransaction(databaseName, tableName).then(clear.bind(clear))
	this.put = data =>
		readwriteTransaction(databaseName, tableName).then(put.bind(put, data))
	this.remove = id =>
		readwriteTransaction(databaseName, tableName).then(remove.bind(remove, id))
	this.get = id =>
		readonlyTransaction(databaseName, tableName).then(get.bind(get, id))
	this.getAll = () =>
		readonlyTransaction(databaseName, tableName).then(getAll.bind(getAll, {}))
}

module.exports = IndexedDBPromise
