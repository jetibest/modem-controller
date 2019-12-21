const puppeteer = require('puppeteer');
const login = require('./login.js');
const logout = require('./logout.js');

module.exports = async function(unit)
{
	unit = unit || '';
	var value = null;
	
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	await login(page, this);
	
	await page.waitFor(() => (document.querySelector('#data2') || {value: '--'}).value !== '--', {timeout: 10000}).catch(err => console.error('error: #data2 not found in document.'));
	value = await page.$eval('#data2', node => node.value).catch(function(){});
	
	await logout(page);
	
	await browser.close();
	
	// for example, value is in GB
	var map = {
		'b': 1,
		'kib': 1024,
		'kb': 1000,
		'mib': 1024 * 1024,
		'mb': 1000 * 1000,
		'gib': 1024 * 1024 * 1024,
		'gb': 1000 * 1000 * 1000,
		'tib': 1024 * 1024 * 1024 * 1024,
		'tb': 1000 * 1000 * 1000 * 1000
	};
	
	return parseInt(parseFloat(value.replace(/^.*?([0-9.]+)\s*([A-Z]*B).*$/gi, function($0, $1, $2)
	{
		return parseFloat($1) * map[$2.toLowerCase()];
	})) / map[(unit || 'B').toLowerCase()]) + '' + unit;
};
