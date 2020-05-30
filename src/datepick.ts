type Coords = {
  row: number;
  col: number;
};

type DateCoords = {
  month: Coords;
  day: Coords;
};

const MONTH_COLS = 4;

/**
 * Gets the coordinates for the given month, 0-based, for the year grid:
 * JAN FEB MAR APR
 * MAY JUN JUL AUG
 * SEP OCT NOV DEC
 */
function getMonthCoords(date: Date): Coords {
  const month: number = date.getMonth(); // 0-based
  return {
    row: Math.floor(month / MONTH_COLS) + 1,  // first row is actually the year, so need to shift
    col: Math.floor(month % MONTH_COLS),
  };
}

/**
 * Gets the coordinates for the given day, 0-based, for the full months. E.g. for May 2020:
 *   0  1  2  3  4  5  6
 *   -------------------
 *   S  M  T  W  T  F  S
 *                  1  2
 *   3  4  5  6  7  8  9
 *  10 11 12 13 14 15 16
 *  17 18 19 20 21 22 23
 *  24 25 26 27 28 29 30
 *  31
 */
function getDayCoords(date: Date): Coords {
  const dayOfWeek = date.getDay(); // 0 - Sunday
  const day = date.getDate() - 1; // getDate() - 1 -> [0; 30]

  // Day of the month has to be shifted to account for the first week,
  // since the name of the month is displayed in the first row and the
  // label is treated as a full cell.
  const row = day <= dayOfWeek ? 0 : Math.floor((day + (7 - dayOfWeek)) / 7);

  // First row is shifted horizontally by the name of the month.
  const col = row == 0 ? day + 1 : dayOfWeek; 

  // Day of the week of the first of the given month.
  const firstOfMonth = (dayOfWeek - (day % 7) + 7) % 7;

  // Sun-Tue will flush the row to fit the name of the month,
  // but only for the first row
  const shift = firstOfMonth <= 2 ? 1 : 0;

  return {
    row: row + shift,
    col: col,
  };
}

/**
 * Gets the coordinates for the date.
 *
 * @param date
 */
export function getCoords(date: Date): DateCoords {
  return {
    day: getDayCoords(date),
    month: getMonthCoords(date),
  };
}
