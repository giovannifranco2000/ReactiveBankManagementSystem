import { default as changeDetection } from "/website/modules/changedetection.js";
import { AccountForm } from "/website/modules/forms.js";

window.addEventListener("DOMContentLoaded", () => {
    changeDetection.registerContainer("render_accounts", "account-list");
    new AccountForm();
});