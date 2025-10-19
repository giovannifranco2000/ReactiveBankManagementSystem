import { default as changeDetection } from "/website/modules/changedetection.js";
import { default as accountsController } from "/website/modules/accountsmvc.js";

window.addEventListener("DOMContentLoaded", () => {
    changeDetection.registerContainer("render_accounts", "account-list");
    accountsController.find();
});