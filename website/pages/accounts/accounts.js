import { AccountForm } from "/website/modules/forms.js";
import { default as accountList, AccountListHTML } from "/website/modules/aggregation.js";

window.addEventListener("DOMContentLoaded", () => {
    new AccountForm();
    let accountListHTML = new AccountListHTML(accountList);
    accountListHTML.render();
});