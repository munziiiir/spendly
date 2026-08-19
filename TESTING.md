# Testing

## Automated tests

```bash
npm test
```

Jest runs with the `jest-expo` preset. All 37 tests pass.

| Suite | File | What it covers |
|---|---|---|
| Reducer | `__tests__/expensesReducer.test.js` | Hydrate sorts newest first, add prepends, update edits only the matching id, delete removes one item, clear empties the list, an unknown action returns the same state, and the reducer never mutates its input. |
| Rates | `__tests__/rates.test.js` | A currency converts to itself unchanged, dollars convert to rufiyaa at the pegged rate of 15.42, the pair round-trips, the result rounds to two decimal places, an unknown currency leaves the amount alone, and every currency the app offers has a rate. |
| Helpers | `__tests__/format.test.js` | Currency formatting for GBP, USD, EUR and MVR, and the fallback for an unknown code. `parseAmount` accepts decimals and rejects empty text, letters, zero, negative values and values above one million. `parseDate` accepts a real date, rejects `2026-02-31`, rejects the wrong format and handles leap years. Date key helpers, the round trip between a date key and a Date in local time, and the month step across a year boundary. |

The reducer holds all list logic and has no React or storage imports. This makes
it possible to test the state changes directly.

`parseAmount` and `parseDate` guard every write into the list, so the tests
target the rejection cases more than the happy path.

## Manual tests

**Run on:** iPhone 17 simulator, iOS 26.5, Expo Go 57.0.9, Expo SDK 57.
**Date run:** 17 August 2026. Tests 33 to 40 were added and run on 19 August 2026,
after the interface was rebuilt around the iOS system look. Tests 1, 3, 6, 7, 11,
12, 13, 27 and 30 were run again on that date and still pass; their steps below
name the controls as they are now.

| # | Test | Steps | Expected result | Result |
|---|---|---|---|---|
| 1 | Add an expense | Tap "Add expense" on the Expenses tab, enter £24.00, category Transport, note, tap Add | The sheet closes and the expense appears at the top of the list under "Today" | Pass |
| 2 | Data survives a restart | Force-quit Expo Go, open the project again | The expense is still in the list and the month total is correct | Pass |
| 3 | Edit an expense | Tap a row, change £3.20 to £4.10, tap Save | The list and the month total show the new amount | Pass |
| 4 | Delete needs confirmation | Open an expense, tap "Delete Expense", tap Cancel | The alert closes and the expense stays in the list | Pass |
| 5 | Delete removes the expense | Repeat test 4, tap Delete | The screen closes and the expense is gone from the list | Pass |
| 6 | Category filter | Tap the "Food & Drink" chip | Only Food & Drink expenses stay in the list | Pass |
| 7 | Empty category state | Tap the "Other" chip | "Nothing in this category" appears | Pass |
| 8 | Month total | Compare the total on the summary card with the list | The total counts only the expenses of the current month | Pass |
| 9 | Stats month arrows | Stats tab, tap the back arrow | The month changes to July 2026 and the chart and totals follow | Pass |
| 10 | Budget bar colours | Set the budget to 500, then 250, then 200 | The bar is green at 42%, amber at 84% and red at 105% | Pass |
| 11 | Dark mode | Settings, Appearance, tap Dark | Every screen, every title and the tab bar change at once | Pass |
| 12 | Currency change | Settings, Currency, tap USD | Every amount in the app shows the $ symbol | Pass |
| 13 | Empty amount | Open the Add sheet, tap Add with no amount | The banner "Enter an amount" appears, the form scrolls back to it, and the app does not crash | Pass |
| 14 | Impossible date | Try to choose 31 February in the calendar | The calendar offers no such day, so the case cannot arise through the UI. `parseDate` still guards anything written to storage, and its unit test covers the rejection | Pass |
| 15 | Clear all expenses | Settings, Clear all expenses, tap Delete | The list is empty and the "No expenses yet" state returns | Pass |
| 16 | Add opens as a modal | Tap "Add expense" on the Expenses tab | The Add form opens as a sheet over the tabs, and the tab bar holds three tabs only | Pass |
| 17 | Maldivian Rufiyaa | Settings, Currency, tap MVR | Every amount shows the drawn rufiyaa sign in front of the digits | Pass |
| 18 | Budget for one month | Stats, August 2026, enter 100 in the budget field | The label reads "set for this month", the bar turns red at 111%, and "Use default" appears | Pass |
| 19 | Other months keep the default | Step to September 2026 | The budget returns to the £500 default from Settings | Pass |
| 20 | The month budget reaches Home | Open the Expenses tab | The summary card shows the figure set for the current month, not the default | Pass |
| 21 | Category opens to its expenses | Stats, Categories, tap a category bar | The section opens and lists the expenses that make up the figure | Pass |
| 22 | Share view | Stats, tap Share | A ring chart shows the split, with the month total in the middle and a legend below | Pass |
| 23 | Daily view | Stats, tap Daily | One bar per day of the month, with the peak figure and the busiest day | Pass |
| 24 | Trend view | Stats, tap Trend | A line over six months, with the selected month as the last point | Pass |
| 25 | A tap alone does not set a budget | Stats, a month with the default, tap the budget field, tap Done without typing | The month still reads "default from Settings" and no "Use default" button appears | Pass |
| 26 | Charts in the dark theme | Set the theme to Dark, open each of the four views | Every chart, label and legend stays readable | Pass |
| 27 | Currency conversion | With expenses recorded in MVR, switch to USD | The month total falls from 213.44 to 13.84, and every row converts with it | Pass |
| 28 | The budget converts too | Switch back to MVR | The budget of 400 dollars reads as 6168.00 rufiyaa, and the percentage stays the same | Pass |
| 29 | The entered figure survives | Switch currency twice and return to the first one | Every amount reads exactly as it was entered | Pass |
| 30 | The date picker opens | Open the Add sheet and tap the date | A calendar fades in below the field, in the colours of the current theme, and the form scrolls it fully into view | Pass |
| 31 | Choosing a day | Tap 11 in the calendar | The field reads "11 Aug 2026" and the calendar marks that day | Pass |
| 32 | The quick buttons still work | Tap "Yesterday" | The field reads the date of yesterday and the calendar closes | Pass |
| 33 | No native bar button behind the sheet | Open the Add sheet and look at the toolbar | Cancel, the title and Add sit on one flat surface. The grey liquid glass capsule iOS 26 drew behind the old Cancel button is gone | Pass |
| 34 | The keyboard never covers the field | Settings, tap the budget field | The page scrolls the field up and it stays well clear of the keyboard | Pass |
| 35 | The compact title appears | Expenses tab, scroll down | The large title travels up and a small "Expenses" title fades in at the top | Pass |
| 36 | The segmented thumb travels | Stats, tap Share | The white thumb slides from Categories to Share rather than jumping | Pass |
| 37 | A day is one card | Expenses tab with two or more expenses on a day | The day's rows share one rounded card, divided by hairlines that start at the label | Pass |
| 38 | The sheet lifts in dark mode | Set the theme to Dark and open the Add sheet | The sheet is lighter than the page behind it, so its edge is visible | Pass |
| 39 | Every way out of the sheet still works | Open the Add sheet, tap Cancel; open it again and swipe it down | The sheet closes both ways and nothing is saved | Pass |

## Defects found and fixed

| Defect | Cause | Fix |
|---|---|---|
| `parseAmount` accepted `-4` as `4` | The clean-up step removed the minus sign before the "more than zero" check ran | The check now reads the original text, so a minus sign is rejected |
| The date error stayed on screen after the user corrected the date | The error only cleared on the next submit | The error clears as soon as the date changes |
| The Add button opened a blank screen | `app/(tabs)/add.js` and `app/add.js` both resolve to `/add`, because a group in brackets does not appear in the path | The modal moved to `app/expense/new.js`, next to the edit route |
| The tab bar hit "Maximum update depth exceeded" | The placeholder route redirected to the modal on every render | The placeholder renders nothing; only the button navigates. The placeholder is gone now that the button left the tab bar |
| A tap on the budget field pinned the month to the default | The field commits on blur, and it already held the default figure, so a tap and a tap away wrote that figure as an override | The commit stops when the month follows the default and the figure did not change |
| The rufiyaa sign appeared after the digits | Thaana Raa is a right-to-left letter, so it turned the whole line right-to-left | The sign is now drawn with SVG, so no letter and no text direction is involved |
| The budget did not convert with the expenses | Budgets were plain numbers with no currency, so 400 stayed 400 after a switch and no longer meant the same money | Budgets are held in one base currency and converted for display, with a one-time migration of saved settings |
| A failed read of the saved expenses could save an empty list over the real one | The write-back effect only waited for the initial load to finish. A read that failed also ended the load, so the effect ran with an empty list in memory and wrote it | The provider will not write until the saved list has been read, or until the user changes something on purpose |
| The one-time migration of saved budgets could never run | The load fills in any missing setting from the defaults before the version check, and the defaults carry the current version number, so an older saved file always looked current | The version is read from the saved file itself, before the defaults are merged in |
| The compact title bar passed taps through to the rows it covered | The bar is drawn over the list and was marked `pointerEvents="none"` so it would not block the list while it was invisible. Once it faded in it stayed transparent to touch, so a tap on it reached whichever row had scrolled underneath | The bar now takes its own taps while it is solid and lets them through while it is not. Found by reading the code; the list in the test data is too short to scroll a row under the bar, so it is not in the table above |
| The "Use default" button sat outside its card on a narrower screen | The budget field beside it would not shrink below the width of its own text | The field is allowed to shrink, so the row fits the card at any width |
| The month labels under the trend line did not sit under their own points | The line placed its points from edge to edge while the labels were spread by the layout, so the two never matched | The chart gives each month an equal column and puts the point in the middle of it, and the labels use the same columns |

The first defect came from the unit tests. The next batch came from the manual
tests. The last four came from reading the whole codebase again before
submission, and from checking each screen at a narrower screen width than the
one the manual tests ran on.

## A note on Expo Go

Twice during development the app failed with `Cannot find native module 'ExpoAsset'`
after a JavaScript crash or a restart of the bundler. This is a stale Expo Go
process, not a fault in the app. A full quit of Expo Go and a fresh open of the
project clears it every time.

## Error handling

`src/utils/storage.js` wraps every AsyncStorage call in try/catch and returns an
`ok` flag. A read failure gives an empty list instead of a crash on launch, and
the app shows an error banner. The provider also filters the loaded array, so a
damaged storage value cannot put a broken record into the list.

An empty list in memory after a failed read is not the same thing as an empty
list the user asked for, so the provider will not write one back. Saving resumes
as soon as the read succeeds, or as soon as the user adds, edits, deletes or
clears something themselves.
