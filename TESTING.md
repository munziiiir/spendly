# Testing

## Automated tests

```bash
npm test
```

Jest runs with the `jest-expo` preset. All 25 tests pass.

| Suite | File | What it covers |
|---|---|---|
| Reducer | `__tests__/expensesReducer.test.js` | Hydrate sorts newest first, add prepends, update edits only the matching id, delete removes one item, clear empties the list, an unknown action returns the same state, and the reducer never mutates its input. |
| Helpers | `__tests__/format.test.js` | Currency formatting for GBP, USD and EUR. `parseAmount` accepts decimals and rejects empty text, letters, zero, negative values and values above one million. `parseDate` accepts a real date, rejects `2026-02-31`, rejects the wrong format and handles leap years. Date key helpers and the month step across a year boundary. |

The reducer holds all list logic and has no React or storage imports. This makes
it possible to test the state changes directly.

`parseAmount` and `parseDate` guard every write into the list, so the tests
target the rejection cases more than the happy path.

## Manual tests

**Run on:** iPhone 17 simulator, iOS 26.5, Expo Go 57.0.9, Expo SDK 57.
**Date run:** 17 August 2026.

| # | Test | Steps | Expected result | Result |
|---|---|---|---|---|
| 1 | Add an expense | Add tab, enter £12.40, category Food & Drink, note, Save | The expense appears at the top of the Expenses list under "Today" | Pass |
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

## Defects found and fixed

| Defect | Cause | Fix |
|---|---|---|
| `parseAmount` accepted `-4` as `4` | The clean-up step removed the minus sign before the "more than zero" check ran | The check now reads the original text, so a minus sign is rejected |
| The date error stayed on screen after the user corrected the date | The error only cleared on the next submit | The error clears as soon as the date changes |

The first defect came from the unit tests. The second came from the manual tests.

## Error handling

`src/utils/storage.js` wraps every AsyncStorage call in try/catch and returns an
`ok` flag. A read failure gives an empty list instead of a crash on launch, and
the app shows an error banner. The provider also filters the loaded array, so a
damaged storage value cannot put a broken record into the list.
