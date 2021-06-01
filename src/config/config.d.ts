declare namespace Configuration {
	// Serves as a template, so doesn't have any crawl specific values, like start date.
	type CrawlRequest = {
		arrivalDate: Date;
		departureDate: Date;
		parkName: string;
		equipment: string;
	};

	// Email receiver data.
	type Receiver = {
		email: string;
		name?: string;
	};

	// Specifies the run that is requested, with multiple crawl requests and receivers
	// of the notification. Can be extended with other information specific to the request.
	type RunRequest = {
		crawlRequests: CrawlRequest[];
		receivers: Receiver[];
	};
}
