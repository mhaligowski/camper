import { PageCrawlRequest } from "../crawler";

export function parse(input: string): PageCrawlRequest[] {
	const raw: Array<any> = JSON.parse(input);
	raw.forEach((element) => {
		element.arrivalDate = new Date(element.arrivalDate);
		element.departureDate = new Date(element.departureDate);
	});

	return raw as PageCrawlRequest[];
}
