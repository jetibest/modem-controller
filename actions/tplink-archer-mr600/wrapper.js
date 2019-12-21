const puppeteer = require('puppeteer');
const login = require('./login.js');
const logout = require('./logout.js');

module.exports = async function(context, fncs)
{
	var value = null;
	
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	if(!await login(page, context))
	{
		await browser.close();
		return value;
	}
	
	try
	{
		if(!Array.isArray(fncs))
		{
			fncs = [fncs];
		}
		
		for(var i=0;i<fncs.length;++i)
		{
			var item = fncs[i];
			
			if(item.click)
			{
				await context.waitnclick(page, item.click).catch(err => {throw 'error: waited too long for clicking: ' + item.click});
			}
			else if(item.eval)
			{
				await context.waitneval(page, item.eval, item.fn, item.args).catch(err => {throw 'error: waited too long for evaluating: ' + item.eval});
			}
			else
			{
				await item(page);
			}
		}
	}
	catch(err)
	{
		console.error(err);
	}
	
	await logout(page);
	
	await browser.close();
	
	return value;
};

