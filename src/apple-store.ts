import cheerio, { CheerioAPI } from 'cheerio';
import { writeFile } from 'fs/promises';
import { getHTML } from './utils/scraper';

const url =
	'https://apps.apple.com/us/genre/ios-utilities/id6002?letter=*&page=2#page';

interface App {
	url: string;
	name: string;
}

interface AppDetails extends App {
	price: string;
	rating: number;
	numRatings: number;
}

const data: AppDetails[] = [];

const getRating = ($: CheerioAPI) => {
	const text = $('.we-rating-count.star-rating__count').text();
	const [rating, numRatings] = text.split(' • ');

	if (!text) {
		return {
			rating: 0,
			numRatings: 0,
		};
	}

	if (!rating || !numRatings) {
		console.log({ text, rating, numRatings });

		throw new Error('Rating not found');
	}

	return {
		rating: Number(rating),
		numRatings: Number(numRatings.replace('Ratings', '')),
	};
};

const getPrice = ($: CheerioAPI): string => {
	return $('.app-header__list__item--price').text();
};

const getApp = async (app: App): Promise<AppDetails> => {
	const html = await getHTML(app.url);

	const $ = cheerio.load(html);

	return {
		...app,
		...getRating($),
		price: getPrice($),
	};
};

const run = async () => {
	const html = await getHTML(url);

	const $ = cheerio.load(html);
	const apps = $('#selectedcontent ul li a')
		.toArray()
		.map((link) => {
			const $link = $(link);
			return {
				url: $link.attr('href') || '',
				name: $link.text(),
			};
		})
		.filter<App>((app): app is App => {
			return Boolean(app.url);
		});

	for (let index = 0; index < apps.length; index++) {
		const app = apps[index];
		try {
			const details = await getApp(app);

			data.push(details);
			console.log(
				details.name,
				details.price,
				details.rating,
				details.numRatings,
			);
		} catch (error) {
			console.log('ERROR', app);

			throw error;
		}
	}

	await writeFile('./data.json', JSON.stringify(data), 'utf8');
};

run();
