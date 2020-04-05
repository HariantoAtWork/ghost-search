const fs = require('fs')
const path = require('path')
const { types } = require('node-sass')

function sassFunctions(options) {
	options = options || {}
	options.base = options.base || process.cwd()

	const functions = {
		'inline-image($file)': (file, done) => {
			file = path.resolve(options.base, file.getValue())
			const ext = file.split('.').pop()
			fs.readFile(file, (err, data) => {
				if (err) return done(err)
				data = new Buffer(data)
				data = data.toString('base64')
				data = 'url(data:image/' + ext + ';base64,' + data + ')'
				data = types.String(data)
				done(data)
			})
		},
		'inline-font($file)': (file, done) => {
			file = path.resolve(options.base, file.getValue())
			const ext = file.split('.').pop()
			fs.readFile(file, (err, data) => {
				if (err) return done(err)
				data = new Buffer(data)
				data = data.toString('base64')
				data = 'url(data:font/' + ext + ';base64,' + data + ')'
				data = types.String(data)
				done(data)
			})
		}
	}

	return functions
}

module.exports = sassFunctions
