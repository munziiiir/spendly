/**
 * Placeholder for the Add slot of the tab bar.
 *
 * The tab bar needs a route for every slot, but this slot never opens a
 * screen: AddTabButton replaces its button and pushes the /expense/new modal
 * on the root stack instead. The component therefore renders nothing.
 *
 * The real Add form lives in app/expense/new.js.
 */
export default function AddTabPlaceholder() {
  return null;
}
