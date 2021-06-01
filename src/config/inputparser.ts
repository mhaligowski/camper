import { PageCrawlRequest } from "../crawler";

export function parse(input: string): PageCrawlRequest[] {
	const raw: Array<any> = JSON.parse(input);
	raw.forEach((element) => {
		element.arrivalDate = new Date(element.arrivalDate);
		element.departureDate = new Date(element.departureDate);
	});

	return raw as PageCrawlRequest[];
}

export function parseToConfig(input: string): Configuration.RunRequest {
	const raw: Configuration.RunRequest = JSON.parse(input);
	raw.crawlRequests.forEach((element) => {
		element.arrivalDate = new Date(element.arrivalDate);
		element.departureDate = new Date(element.departureDate);
	});

	return raw;
}
