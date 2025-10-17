import { default as changeDetection } from "/website/modules/changedetection.js";
import { AccountForm } from "/website/pages/accounts/accountsform.js";

import { default as accountsController } from "/website/pages/accounts/accountsmvc.js";

window.addEventListener("DOMContentLoaded", () => {
    changeDetection.registerContainer("render_accounts", "account-list");
    accountsController.find();
    new AccountForm();
});