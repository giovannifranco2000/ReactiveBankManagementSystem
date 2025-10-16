import { AccountForm } from "/website/modules/forms.js";
import { default as accountsController, AccountsView } from "/website/modules/aggregation.js";

window.addEventListener("DOMContentLoaded", () => {
    new AccountForm();
    let accountListHTML = new AccountsView(accountsController);
    accountListHTML.renderAll();
});