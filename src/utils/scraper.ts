import axios from 'axios';
import playwright from 'playwright';

// Helper functions to get a random item from an array
const sample = <T>(array: T[]) =>
	array[Math.floor(Math.random() * array.length)];

const headers = [
	{
		Accept:
			'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		'Accept-Encoding': 'gzip, deflate, br',
		'Accept-Language': 'en-US,en;q=0.9',
		'Sec-Ch-Ua':
			'"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
		'Sec-Ch-Ua-Mobile': '?0',
		'Sec-Fetch-Dest': 'document',
		'Sec-Fetch-Mode': 'navigate',
		'Sec-Fetch-Site': 'none',
		'Sec-Fetch-User': '?1',
		'Upgrade-Insecure-Requests': '1',
		'User-Agent':
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
	},
	{
		Accept:
			'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Encoding': 'gzip, deflate, br',
		'Accept-Language': 'en-US,en;q=0.5',
		'Sec-Fetch-Dest': 'document',
		'Sec-Fetch-Mode': 'navigate',
		'Sec-Fetch-Site': 'none',
		'Sec-Fetch-User': '?1',
		'Upgrade-Insecure-Requests': '1',
		'User-Agent':
			'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:90.0) Gecko/20100101 Firefox/90.0',
	},
];

const getHtmlPlaywright = async (url: string) => {
	const browser = await playwright.chromium.launch();
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto(url);
	const html = await page.content();
	await browser.close();

	return html;
};

export const getHTML = async (url: string): Promise<string> => {
	const html = await getHtmlPlaywright(url);

	if (html) {
		return html;
	}

	const response = (await axios.get(url, {
		// proxy,
		// @ts-ignore
		headers: sample(headers),
	})) as Response;

	if (!response.ok) {
		console.log(response.status, response.statusText);

		throw new Error('Error requesting the page');
	}
	return response.text();
};
