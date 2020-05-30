import { getCoords } from "../datepick";

it("should be able to run", () => {
  expect(getCoords(new Date())).not.toBeNull();
});

/*
 * Months for reference
 *
 *   JAN   FEB   MAR   APR   0
 *   MAY   JUN   JUL   AUG   1
 *   SEP   OCT   NOV   DEC   2
 */

const date = (the_date: string) => new Date(the_date);

it("Months should be fine", () => {
  expect(getCoords(date("01 Jan 2022")).month).toEqual({ row: 1, col: 0 });
  expect(getCoords(date("01 Feb 2022")).month).toEqual({ row: 1, col: 1 });
  expect(getCoords(date("01 Mar 2022")).month).toEqual({ row: 1, col: 2 });
  expect(getCoords(date("01 Apr 2022")).month).toEqual({ row: 1, col: 3 });
  
  expect(getCoords(date("01 May 2022")).month).toEqual({ row: 2, col: 0 });
  expect(getCoords(date("01 Jun 2022")).month).toEqual({ row: 2, col: 1 });
  expect(getCoords(date("01 Jul 2022")).month).toEqual({ row: 2, col: 2 });
  expect(getCoords(date("01 Aug 2022")).month).toEqual({ row: 2, col: 3 });

  expect(getCoords(date("01 Sep 2022")).month).toEqual({ row: 3, col: 0 });
  expect(getCoords(date("01 Oct 2022")).month).toEqual({ row: 3, col: 1 });
  expect(getCoords(date("01 Nov 2022")).month).toEqual({ row: 3, col: 2 });
  expect(getCoords(date("01 Dec 2022")).month).toEqual({ row: 3, col: 3 });

  expect(getCoords(date("July 1, 2020")).month).toEqual({ row: 2, col: 2 });
});

/*
 * FIRST ROW is calculated "as is".
 *
 *    February 2022
 *  0  1  2  3  4  5  6
 * Su Mo Tu We Th Fr Sa
 * FEB                   0
 *        1  2  3  4  5  1
 *  6  7  8  9 10 11 12  2
 * 13 14 15 16 17 18 19  3
 * 20 21 22 23 24 25 26  4
 * 27 28                 5
 *
 */
it("check february 2022", () => {
  expect(getCoords(date("1 Feb 2022")).day).toEqual({ row: 1, col: 1 });
  expect(getCoords(date("2 Feb 2022")).day).toEqual({ row: 1, col: 2 });
  expect(getCoords(date("3 Feb 2022")).day).toEqual({ row: 1, col: 3 });
  expect(getCoords(date("4 Feb 2022")).day).toEqual({ row: 1, col: 4 });
  expect(getCoords(date("5 Feb 2022")).day).toEqual({ row: 1, col: 5 });
  expect(getCoords(date("6 Feb 2022")).day).toEqual({ row: 2, col: 0 });
  expect(getCoords(date("15 Feb 2022")).day).toEqual({ row: 3, col: 2 });
  expect(getCoords(date("28 Feb 2022")).day).toEqual({ row: 5, col: 1 });
});

/**
 *    May 2020
 *  Su Mo Tu We Th Fr Sa
 *   MAY            1  2  0
 *   3  4  5  6  7  8  9  1
 *  10 11 12 13 14 15 16  2
 *  17 18 19 20 21 22 23  3
 *  24 25 26 27 28 29 30  4
 *  31
 */

it("check may 2020", () => {
  expect(getCoords(date("1 May 2020")).day).toEqual({ row: 0, col: 1 });
  expect(getCoords(date("3 May 2020")).day).toEqual({ row: 1, col: 0 });
  expect(getCoords(date("15 May 2020")).day).toEqual({ row: 2, col: 5 });
  expect(getCoords(date("31 May 2020")).day).toEqual({ row: 5, col: 0 });
});

/**
 *      July 2020
 * Su Mo Tu We Th Fr Sa
 * JUL       1  2  3  4
 *  5  6  7  8  9 10 11
 * 12 13 14 15 16 17 18
 * 19 20 21 22 23 24 25
 * 26 27 28 29 30 31
 */
it("check jul 2020", () => {
  expect(getCoords(date("1 Jul 2020")).day).toEqual({ row: 0, col: 1 });
  expect(getCoords(date("5 Jul 2020")).day).toEqual({ row: 1, col: 0 });
  expect(getCoords(date("15 May 2020")).day).toEqual({ row: 2, col: 5 });
  expect(getCoords(date("31 May 2020")).day).toEqual({ row: 5, col: 0 });
});

/*
 *    September 2020
 * Su Mo Tu We Th Fr Sa
 *        1  2  3  4  5
 *  6  7  8  9 10 11 12
 * 13 14 15 16 17 18 19
 * 20 21 22 23 24 25 26
 * 27 28 29 30
 */
it("check sep 2020", () => {
  expect(getCoords(date("7 Sep 2020")).day).toEqual({ row: 2, col: 1 });
  expect(getCoords(date("9 Sep 2020")).day).toEqual({ row: 2, col: 3 });
});
