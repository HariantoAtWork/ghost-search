const temp = document.createElement('div')

const htmlToText = html => {
	temp.innerHTML = html
	return temp.textContent || temp.innerText || ''
}

module.exports = htmlToText
