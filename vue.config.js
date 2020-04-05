const functions = require('./src/lib/dev/sassFunctions')
module.exports = {
	css: {
		loaderOptions: {
			scss: {
				sassOptions: {
					// outputStyle: 'nested',
					functions
				},
				prependData: `@import "@/scss/fonts.scss";`
			}
		}
	}
}
