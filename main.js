// Automatically send SMS if data is larger than a given value, for instance
// So we need to be able to get the currently used data value from the dashboard
// And we need to be able to send an SMS

var context = {
	waitnclick: async function(page, selector)
	{
		try
		{
			await page.waitFor(selector, {timeout: 5000});
			return await page.click(selector);
		}
		catch(err)
		{
			throw err;
			return err;
		}
	},
	waitneval: async function(page, selector, fn, args)
	{
		try
		{
			await page.waitFor(selector, {timeout: 5000});
			return await page.$eval.apply(page, [selector, fn].concat(args || []));
		}
		catch(err)
		{
			throw err;
			return err;
		}
	},
	device: 'tplink-archer-mr600',
	address: '192.168.1.1',
	port: 80,
	username: '',
	password: ''
};
var addressConsumed = false;
var action = '';
var actionparams = [];
for(var i=2;i<process.argv.length;++i)
{
	var a = process.argv[i];
	var next = '';
	if(i + 1 < process.argv.length)
	{
		next = process.argv[i + 1];
	}
	if(a === '-f' || a === '-i')
	{
		context['actionfile'] = next;
		if(i + 1 < process.argv.length) ++i;
	}
	else if(a === '-pw')
	{
		context['password'] = next;
		if(i + 1 < process.argv.length) ++i;
	}
	else if(a === '-d')
	{
		context['device'] = next;
		if(i + 1 < process.argv.length) ++i;
	}
	else if(a === '-u')
	{
		context['username'] = next;
		if(i + 1 < process.argv.length) ++i;
	}
	else if(a === '-a')
	{
		action = next.replace(/^(.*)\/(.*)$/gi, ($0, $1, $2) =>
		{
			context.device = $1;
			return $2;
		});
		if(i + 1 < process.argv.length) ++i;
		if(i + 1 < process.argv.length)
		{
			actionparams = process.argv.slice(i + 1);
		}
		break;
	}
	else if(/^--[a-z0-9-]+(|=.*)$/gi.test(a))
	{
		var key = a;
		var value = '';
		var offset = a.indexOf('=');
		if(offset > 0)
		{
			value = a.substring(offset + 1);
			key = a.substring(0, offset);
		}
		else if(i + 1 < process.argv.length)
		{
			value = next;
			++i;
		}
		key = key
			.replace(/^--/g, '')
			.replace(/-([a-z])/gi, ($0, $1) => $1.toUpperCase());
		
		if(key === 'action')
		{
			action = value;
			actionparams = process.argv.slice(i + 1);
			break;
		}
		else
		{
			context[key] = value;
		}
	}
	else if(/^[0-9]+$/gi.test(a))
	{
		context['port'] = a;
	}
	else if(!addressConsumed && /^[a-f0-9[\]:.]+$/gi.test(a))
	{
		addressConsumed = true;
		context['address'] = a
			.replace(/^(\[.*\]|[0-9.]+):([0-9]+)$/gi, ($0, $1, $2) =>
			{
				context['port'] = $2;
				return $1;
			})
			.replace(/^\[(.*)\]$/gi, ($0, $1) => $1);
	}
	else if(/^[a-z0-9-/.]+\.js$/gi.test(a))
	{
		context.actionfile = a;
		if(i + 1 < process.argv.length)
		{
			actionparams = process.argv.slice(i + 1);
		}
		break;
	}
	else if(/^[a-z0-9./-]+$/gi.test(a))
	{
		action = a.replace(/^(.*)[/](.*)$/gi, ($0, $1, $2) =>
		{
			context.device = $1;
			return $2;
		});
		if(i + 1 < process.argv.length)
		{
			actionparams = process.argv.slice(i + 1);
		}
		break;
	}
}

if(!action && !context.actionfile)
{
	console.log('Usage: node main.js 192.168.1.1 -d [device] -u [username] -pw [password] [action] [param1] [param2] [...]');
	console.log('Usage: node main.js 192.168.1.1 tplink-archer-mr600/get-data-usage-total MB');
}
else
{
	// do action with actionparams
	(async () =>
	{
		console.log(await require(context.actionfile ? ('./' + context.actionfile) : ('./actions/' + context.device + '/' + action + '.js')).apply(context, actionparams).catch(console.error));
	})();
}
