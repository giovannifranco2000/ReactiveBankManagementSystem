import { default as accountsController } from "/modules/client/accountsmvc.js";
import { default as changeDetection } from "/modules/js_framework/changedetection.js";

window.addEventListener("DOMContentLoaded", () => {
    changeDetection.registerContainer("render_accounts", "account-list");
    accountsController.find();
});