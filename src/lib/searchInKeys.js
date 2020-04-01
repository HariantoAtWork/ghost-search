const searchInKeys = object => {
	const foundKeys = []
	const keys = ['title', 'html', 'custom_excerpt', 'excerpt']

	keys.forEach(key => {
		if (object[key]) foundKeys.push(object[key].toLowerCase())
	})
	return foundKeys
}

module.exports = searchInKeys
