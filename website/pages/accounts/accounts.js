import { AccountForm } from "/website/modules/forms.js";
import { AccountList, AccountListHTML } from "/website/modules/aggregation.js";

window.addEventListener("DOMContentLoaded", () => {
    new AccountForm();
    let accountList = new AccountList();
    let accountListHTML = new AccountListHTML(accountList);
    accountListHTML.render();
});