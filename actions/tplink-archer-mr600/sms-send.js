const wrapper = require('./wrapper.js');

module.exports = async function(toNumber, textMessage)
{
	var value = 'error: SMS not sent.';
	
	await wrapper(this, [
		{click: '#advanced'},
		{click: '#sms'},
		{click: 'a.click[url="lteSmsNewMsg.htm"]'},
		{eval: '#toNumber', fn: (node, $1) => node.value = $1, args: [toNumber]},
		{eval: '#inputContent', fn: (node, $1) => node.value = $1, args: [textMessage]},
		{click: '#send'},
		async page =>
		{
			await page.waitFor('.lteSmsTips-container .correct-icon-lteSmsTips', {visible: true, timeout: 5000})
				.then(res => value = 'ok: SMS sent.')
				.catch(err => {throw 'error: SMS success message did not appear.'});
			await page.waitFor(2000); // wait for confirmation to disappear
		}
	]);
	
	return value;
};
