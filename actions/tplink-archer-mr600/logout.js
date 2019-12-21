const puppeteer = require('puppeteer');

module.exports = async function(page)
{
	var loggedOut = false;
	
	await page.click('#topLogout').then(async function()
	{
		await Promise.all([
			page.waitForNavigation({waitUntil: 'networkidle0', timeout: 10000}).then(res => loggedOut = true).catch(err => console.error('warning: timeout waiting for logout request to process')),
			page.click('.alert-container .btn-msg-ok').catch(err => console.error('notice: No confirm of logout possible.'))
		]);
	}).catch(function(){console.error('no logout possible');});
	
	return loggedOut;
};

