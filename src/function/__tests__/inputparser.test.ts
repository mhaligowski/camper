import { parse } from "../inputparser";

it("should return empty array for empty input", () => {
	const input = "[]";
	expect(parse(input)).toEqual([]);
});

it("should be able to parse a single job", () => {
	const input = `[{
			"arrivalDate": 1593586800000,
			"departureDate": 1593932400000,
			"parkName": "Lake Chelan State Park",
			"equipment": "1 Tent"
		}]`;

	const expected = [
		{
			arrivalDate: new Date("July 1, 2020"),
			departureDate: new Date("July 5, 2020"),
			parkName: "Lake Chelan State Park",
			equipment: "1 Tent",
		},
	];

	expect(parse(input)).toEqual(expected);
});
