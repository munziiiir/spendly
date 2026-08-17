# Testing

## Automated tests

```bash
npm test
```

Jest runs with the `jest-expo` preset. All 27 tests pass.

| Suite | File | What it covers |
|---|---|---|
| Reducer | `__tests__/expensesReducer.test.js` | Hydrate sorts newest first, add prepends, update edits only the matching id, delete removes one item, clear empties the list, an unknown action returns the same state, and the reducer never mutates its input. |
| Helpers | `__tests__/format.test.js` | Currency formatting for GBP, USD, EUR and MVR, and the fallback for an unknown code. `parseAmount` accepts decimals and rejects empty text, letters, zero, negative values and values above one million. `parseDate` accepts a real date, rejects `2026-02-31`, rejects the wrong format and handles leap years. Date key helpers and the month step across a year boundary. |

The reducer holds all list logic and has no React or storage imports. This makes
it possible to test the state changes directly.

`parseAmount` and `parseDate` guard every write into the list, so the tests
target the rejection cases more than the happy path.

## Manual tests

**Run on:** iPhone 17 simulator, iOS 26.5, Expo Go 57.0.9, Expo SDK 57.
**Date run:** 17 August 2026.

| # | Test | Steps | Expected result | Result |
|---|---|---|---|---|
| 1 | Add an expense | Tap the raised button, enter £24.00, category Transport, note, Save | The modal closes and the expense appears at the top of the list under "Today" | Pass |
| 2 | Data survives a restart | Force-quit Expo Go, open the project again | The expense is still in the list and the month total is correct | Pass |
| 3 | Edit an expense | Tap a row, change £3.20 to £4.10, Save changes | The list and the month total show the new amount | Pass |
| 4 | Delete needs confirmation | Open an expense, tap Delete expense, tap Cancel | The alert closes and the expense stays in the list | Pass |
| 5 | Delete removes the expense | Repeat test 4, tap Delete | The screen closes and the expense is gone from the list | Pass |
| 6 | Category filter | Tap the "Food & Drink" chip | Only Food & Drink expenses stay in the list | Pass |
| 7 | Empty category state | Tap the "Other" chip | "Nothing in this category" appears | Pass |
| 8 | Month total | Compare the header total with the list | The total counts only the expenses of the current month | Pass |
| 9 | Stats month arrows | Stats tab, tap the back arrow | The month changes to July 2026 and the chart and totals follow | Pass |
| 10 | Budget bar colours | Set the budget to 500, then 250, then 200 | The bar is green at 42%, amber at 84% and red at 105% | Pass |
| 11 | Dark mode | Settings, Appearance, tap Dark | Every screen, the header and the tab bar change at once | Pass |
| 12 | Currency change | Settings, Currency, tap USD | Every amount in the app shows the $ symbol | Pass |
| 13 | Empty amount | Add tab, tap Save with no amount | The banner "Enter an amount" appears and the app does not crash | Pass |
| 14 | Impossible date | Enter the date `2026-02-31` and Save | The message "That date does not exist" appears and nothing is saved | Pass |
| 15 | Clear all expenses | Settings, Clear all expenses, tap Delete | The list is empty and the "No expenses yet" state returns | Pass |
| 16 | Add opens as a modal | Tap the raised button in the tab bar | The Add form opens as a sheet over the tabs, not as a tab | Pass |
| 17 | Maldivian Rufiyaa | Settings, Currency, tap MVR | Every amount shows "Rf" with a space, for example "Rf 110.50" | Pass |
| 18 | Budget for one month | Stats, August 2026, enter 100 in the budget field | The label reads "set for this month", the bar turns red at 111%, and "Use default" appears | Pass |
| 19 | Other months keep the default | Step to September 2026 | The budget returns to the £500 default from Settings | Pass |
| 20 | The month budget reaches Home | Open the Expenses tab | The header bar shows the figure set for the current month, not the default | Pass |
| 21 | Category opens to its expenses | Stats, Categories, tap a category bar | The section opens and lists the expenses that make up the figure | Pass |
| 22 | Share view | Stats, tap Share | A ring chart shows the split, with the month total in the middle and a legend below | Pass |
| 23 | Daily view | Stats, tap Daily | One bar per day of the month, with the peak figure and the busiest day | Pass |
| 24 | Trend view | Stats, tap Trend | A line over six months, with the selected month as the last point | Pass |

## Defects found and fixed

| Defect | Cause | Fix |
|---|---|---|
| `parseAmount` accepted `-4` as `4` | The clean-up step removed the minus sign before the "more than zero" check ran | The check now reads the original text, so a minus sign is rejected |
| The date error stayed on screen after the user corrected the date | The error only cleared on the next submit | The error clears as soon as the date changes |
| The raised button opened a blank screen | `app/(tabs)/add.js` and `app/add.js` both resolve to `/add`, because a group in brackets does not appear in the path | The modal moved to `app/expense/new.js`, next to the edit route |
| The tab bar hit "Maximum update depth exceeded" | The placeholder route redirected to the modal on every render | The placeholder renders nothing; only the button navigates |

The first defect came from the unit tests. The other three came from the manual
tests.

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
