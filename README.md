# Spendly

Spendly is an offline expense tracker for Android and iOS, built with React Native
and Expo. You record what you spend, sort it into categories, and see where your
money goes each month against a budget you set. The app has no backend and no
account: every expense stays in the storage of your own phone.

---

## Installation and how to run it

You need Node.js and the Expo Go app on your phone. Development used Node
v24.10.0. There is no API key, no backend and no environment file to set up.

```bash
git clone <repository-url>
cd mobile
npm install
npx expo start
```

Open Expo Go on your phone and scan the QR code in the terminal. The app opens
directly. To run it on a simulator instead, press `i` for iOS or `a` for Android
in the same terminal.

To run the tests:

```bash
npm test
```

---

## Features

| Feature | What it does |
|---|---|
| **Multi-screen navigation** | Four bottom tabs (Expenses, Add, Stats, Settings) built with Expo Router. A stack sits above the tabs, and the edit screen opens on top of them as a modal through the dynamic route `app/expense/[id].js`. |
| **State management with the Context API** | Two React contexts hold all state. `ExpensesContext` holds the list and its create, update and delete actions, and uses `useReducer` with a pure reducer. `SettingsContext` holds the currency, the theme and the budget. |
| **Persistence with AsyncStorage** | The app reads the saved data once when it starts, and writes it back after every change. Your expenses and settings survive a force-quit and a restart of the phone. |
| **Works offline** | There is no network call anywhere in the app. Spendly works the same in aeroplane mode. |
| Add an expense | Enter an amount, pick one of seven categories, add an optional note, and pick a date. The form rejects an empty amount, a negative amount and an impossible date such as `2026-02-31`. |
| Edit and delete | Tap any row to open it. Change it and save, or delete it after a confirmation alert. |
| Expense list by day | The list groups expenses under "Today", "Yesterday" and full dates, newest first. |
| Category filter | A chip bar filters the list to one category. An empty category shows its own message. |
| Monthly total and budget bar | The header shows what you spent this month. The bar below it turns green, amber at 80% and red at 100% of your budget. |
| Statistics | A month switcher, the total and the count for that month, a bar chart of the share of each category, and the largest single expense. |
| Settings | Theme (System, Light or Dark), currency (GBP, USD or EUR), the monthly budget, and a destructive "Clear all expenses" action. |
| Light and dark themes | Every colour comes from one theme file. The whole app, the headers and the tab bar change together. |
| Accessibility | Buttons, chips, inputs and the budget bar carry accessibility roles, labels and states for screen readers. |

---

## Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="assets/screenshots/home-light.png" width="250" alt="Expenses list in the light theme"><br>
      <b>Expenses (light)</b><br>
      The month total, the budget bar, the category filter and the list grouped by day.
    </td>
    <td align="center" width="50%">
      <img src="assets/screenshots/home-dark.png" width="250" alt="Expenses list in the dark theme"><br>
      <b>Expenses (dark)</b><br>
      The same screen after you set the theme to Dark in Settings.
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/screenshots/add.png" width="250" alt="The add expense form"><br>
      <b>Add</b><br>
      Amount, category grid, note and date, with "Today" and "Yesterday" shortcuts.
    </td>
    <td align="center">
      <img src="assets/screenshots/edit.png" width="250" alt="The edit expense modal"><br>
      <b>Edit</b><br>
      The same form opened as a modal from the list, with a delete action.
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/screenshots/stats.png" width="250" alt="The statistics screen"><br>
      <b>Stats</b><br>
      Month switcher, totals, the share of each category and the largest expense.
    </td>
    <td align="center">
      <img src="assets/screenshots/settings.png" width="250" alt="The settings screen"><br>
      <b>Settings</b><br>
      Theme, currency, monthly budget and the clear-all action.
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="assets/screenshots/empty-state.png" width="250" alt="The empty state of the expenses list"><br>
      <b>Empty state</b><br>
      What a new user sees before the first expense.
    </td>
  </tr>
</table>

---

## Technologies used

| Technology | Use |
|---|---|
| React Native 0.86 | The UI framework. |
| Expo SDK 57 | The toolchain and the runtime. The app runs in Expo Go with no native build. |
| Expo Router 57 | File-based navigation: bottom tabs, a stack, a modal and a dynamic route. |
| React Context + `useReducer` | State management for the expense list and the user settings. |
| AsyncStorage 2.2.0 | Local storage on the phone. |
| @expo/vector-icons (Ionicons) | All icons in the tab bar, the category grid and the list. |
| Jest + jest-expo | The unit tests for the reducer and the helpers. |

---

## Project structure

```
app/                          Routes (Expo Router)
  _layout.js                  Root stack: providers, themed header, modal route
  (tabs)/_layout.js           Bottom tab navigator
  (tabs)/index.js             Expenses: month total, budget bar, filter, list
  (tabs)/add.js               Add tab
  (tabs)/stats.js             Stats: month switcher, category chart
  (tabs)/settings.js          Settings: theme, currency, budget, clear all
  expense/[id].js             Edit screen (dynamic route, opens as a modal)
src/
  components/                 ScreenContainer, EmptyState, ErrorBanner,
                              ExpenseItem, CategoryChips, BudgetBar, ExpenseForm
  constants/categories.js     The seven categories and the three currencies
  context/expensesReducer.js  Pure reducer for the list
  context/ExpensesContext.js  Provider, CRUD actions, storage
  context/SettingsContext.js  Provider for currency, theme and budget
  theme/index.js              Light and dark palettes, spacing and radius scales
  utils/format.js             Money and date formatting, input validation
  utils/storage.js            AsyncStorage wrappers that never throw
__tests__/                    Jest unit tests
assets/screenshots/           The images in this README
TESTING.md                    The test report
```

---

## Known issues and future improvements

- **The date is a text field, not a native picker.** You must type `YYYY-MM-DD`.
  The "Today" and "Yesterday" buttons cover the common cases, but a native date
  picker would be better. It needs one more package, and the aim was to keep the
  app free of extra dependencies.
- **No cloud sync and no multiple devices.** The data lives on one phone. If you
  delete the app, the data goes with it.
- **No export.** There is no CSV or PDF export of the expenses.
- **No recurring expenses.** You must enter a monthly bill again each month.
- **The categories are fixed.** You cannot add, rename or remove a category.
- **One budget for all months.** The budget is a single number, not a figure per
  month or per category.
- **No search.** The category filter is the only way to reduce the list.

---

## Reflection

The scaffold made the two contexts and the theme system look easy, but the real
work started when the app first ran on a phone. Two route files were declared in
the navigators before they existed, so the app could not open at all. That was a
good lesson: with file-based routing, a screen that a navigator names must exist,
or nothing renders.

State management was the part I understood best by the end. Splitting the state
into two contexts was the right choice. The settings change rarely, and keeping
them apart from the expense list stops a currency change from re-rendering
everything through the same value object. Putting all list logic in a pure
reducer also paid off twice: the screens stay simple, and I could test every
state change without a renderer or a storage mock.

Persistence looked like the easy part and was the part I trusted least. Writing
to storage on every change is simple, but I had to be careful not to write during
the first load, because that would save an empty list over real data. Testing it
properly meant a force-quit and a restart, not a reload. A reload keeps the
process alive and proves nothing.

Testing found two real defects. A unit test showed that `parseAmount` stripped the
minus sign before the "more than zero" check, so `-4` became `4`. Manual testing
showed that a date error stayed on screen after I corrected the date. Both were
one-line fixes, and neither would have shown up if I had only clicked through the
happy path.

If I did this again, I would build one full screen end to end before I wrote any
other screen. I wrote most of the UI before I ran the app once, and a first run
much earlier would have found the missing routes in minutes instead of at the end.
