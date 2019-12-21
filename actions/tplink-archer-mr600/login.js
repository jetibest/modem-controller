const puppeteer = require('puppeteer');

module.exports = async function(page, options)
{
	options = options || {};
	
	var loggedIn = false;
	
	page.goto('http://' + (options.address || '192.168.1.1') + ':' + (options.port || 80) + '/' + (options.path || ''));
	
	await page.waitFor('#pc-login-password', {timeout: 5000});
	await page.$eval('#pc-login-password', (node, pw) => node.value = pw, options.password).catch(err => console.error('error: #pc-login-password not found; cannot fill in the password.'));

	await page.waitFor('#confirm-yes', {timeout: 500}).catch(function(){}); // err => console.error('notice: No confirm yes found.'));
	await page.click('#confirm-yes').catch(function(){}); // err => console.error('notice: Did not confirm yes.'));
	
	await page.click('#pc-login-btn').catch(err => console.error('error: #pc-login-btn not found; cannot login.'));
	
	await page.waitFor('#confirm-yes', {timeout: 500}).catch(function(){}); // err => console.error('notice: No confirm yes found.'));
	await page.click('#confirm-yes').catch(function(){}); // err => console.error('notice: Did not confirm yes.'));
	
	await page.waitFor('#topLogout', {timeout: 5000}).then(res => loggedIn = true).catch(err => console.error('warning: Login failed.'));
	
	return loggedIn;
};

