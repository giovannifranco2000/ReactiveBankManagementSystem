import { AccountForm } from "/website/pages/new_account/new_account_form.js";

// DEBUG: every new insertion throws an error because the change detection event is not registered yet
// my previous architecture was based on the idea that the list and its form would be on the same page
// now they're not
// also, the add event is fired, but the list was never updated, as it is in another page
// must create an incremental / virtual dom

window.addEventListener("DOMContentLoaded", () => {
    new AccountForm();
});