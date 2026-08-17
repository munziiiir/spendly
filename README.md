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
| **Multi-screen navigation** | Three bottom tabs (Expenses, Stats, Settings) built with Expo Router, plus a raised action button in the tab bar. A stack sits above the tabs: the add form opens on it as a modal (`app/expense/new.js`) and the edit screen opens through the dynamic route `app/expense/[id].js`. |
| **State management with the Context API** | Two React contexts hold all state. `ExpensesContext` holds the list and its create, update and delete actions, and uses `useReducer` with a pure reducer. `SettingsContext` holds the currency, the theme and the budgets. |
| **Persistence with AsyncStorage** | The app reads the saved data once when it starts, and writes it back after every change. Your expenses and settings survive a force-quit and a restart of the phone. |
| **Works offline** | There is no network call anywhere in the app. Spendly works the same in aeroplane mode. |
| Add an expense | The raised button in the tab bar opens the form as a modal. Enter an amount, pick one of seven categories, add an optional note, and pick a date. The form rejects an empty amount, a negative amount and an impossible date such as `2026-02-31`. |
| Edit and delete | Tap any row to open it. Change it and save, or delete it after a confirmation alert. |
| Expense list by day | The list groups expenses under "Today", "Yesterday" and full dates, newest first. |
| Category filter | A chip bar filters the list to one category. An empty category shows its own message. |
| Monthly total and budget bar | The header shows what you spent this month. The bar below it turns green, amber at 80% and red at 100% of your budget. |
| Budget for a single month | Every month can hold its own budget. A month with no figure of its own uses the default from Settings, so a holiday month does not force you to change the default and change it back. |
| Four ways to read a month | The Stats tab switches between Categories, Share, Daily and Trend. Categories and Share show where the money went, Daily shows when it went, and Trend compares the last six months. |
| Expenses behind a category | Tap a category on the Stats tab to open it and see the expenses that make up the figure. Tap one of them to edit it. |
| Settings | Theme (System, Light or Dark), currency (GBP, USD, EUR or MVR), the default monthly budget, and a destructive "Clear all expenses" action. |
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
      <img src="assets/screenshots/add.png" width="250" alt="The add expense form as a modal"><br>
      <b>Add</b><br>
      The raised button opens the form as a modal over the tabs.
    </td>
    <td align="center">
      <img src="assets/screenshots/edit.png" width="250" alt="The edit expense modal"><br>
      <b>Edit</b><br>
      The same form opened from the list, with a delete action.
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/screenshots/stats.png" width="250" alt="The statistics screen, category view"><br>
      <b>Stats — Categories</b><br>
      The budget for the month, and bars that open to show the expenses behind them.
    </td>
    <td align="center">
      <img src="assets/screenshots/stats-share.png" width="250" alt="The statistics screen, donut chart"><br>
      <b>Stats — Share</b><br>
      A ring chart of the share each category takes of the month.
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/screenshots/stats-trend.png" width="250" alt="The statistics screen, trend line"><br>
      <b>Stats — Trend</b><br>
      Spending over the six months that end with the selected month.
    </td>
    <td align="center">
      <img src="assets/screenshots/settings.png" width="250" alt="The settings screen"><br>
      <b>Settings</b><br>
      Theme, currency, the default budget and the clear-all action.
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
| react-native-svg 15.15.4 | The ring chart and the trend line. The daily bar chart uses plain Views and needs no library. |
| Jest + jest-expo | The unit tests for the reducer and the helpers. |

---

## Project structure

```
app/                          Routes (Expo Router)
  _layout.js                  Root stack: providers, themed header, modal routes
  (tabs)/_layout.js           Bottom tab navigator with the raised Add button
  (tabs)/index.js             Expenses: month total, budget bar, filter, list
  (tabs)/add.js               Placeholder for the Add slot of the tab bar
  (tabs)/stats.js             Stats: month switcher, budget, four chart views
  (tabs)/settings.js          Settings: theme, currency, budget, clear all
  expense/new.js              Add screen (opens as a modal)
  expense/[id].js             Edit screen (dynamic route, opens as a modal)
src/
  components/                 ScreenContainer, EmptyState, ErrorBanner,
                              ExpenseItem, CategoryChips, BudgetBar, ExpenseForm,
                              AddTabButton, MonthBudgetCard, CategoryBreakdown,
                              CategoryDonut, DailyBars, TrendLine
  constants/categories.js     The seven categories and the four currencies
  context/expensesReducer.js  Pure reducer for the list
  context/ExpensesContext.js  Provider, CRUD actions, storage
  context/SettingsContext.js  Provider for currency, theme and budgets
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
- **No budget per category.** A month holds one figure. You cannot cap food or
  transport on their own.
- **No search.** The category filter is the only way to reduce the list.
- **The Add button is not exactly centred.** The tab bar has four slots, so the
  raised button sits between Stats and Settings rather than at the middle of the
  screen. A custom tab bar would fix this.
- **The top of the Add button may not respond on Android.** The button is lifted
  above the tab bar with a negative margin. iOS still accepts a touch there.
  Android drops a touch outside the bounds of the parent, so the top part of the
  circle can be dead. Testing ran on iOS only.
- **The exchange rate is not converted.** Changing the currency changes the
  symbol only. It does not convert the amounts you already recorded.

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

File-based routing caught me a second time when I moved the add form out of the
tabs and into a modal. I left a placeholder route at `app/(tabs)/add.js` and put
the modal at `app/add.js`. Both resolve to `/add`, because a group in brackets
does not appear in the path, so the button opened a blank screen instead of the
form. Moving the modal to `/expense/new` fixed it and reads better next to
`/expense/[id]`.

If I did this again, I would build one full screen end to end before I wrote any
other screen. I wrote most of the UI before I ran the app once, and a first run
much earlier would have found the missing routes in minutes instead of at the end.
