import { default as transactionsController } from "/modules/client/transactionsmvc.js";
import { default as changeDetection } from "/modules/js_framework/changedetection.js";

window.addEventListener("DOMContentLoaded", () => {
    changeDetection.registerContainer("render_transactions", "transaction-list");

    // DEBUG: temporary solution, because my webapp is not single page
    const urlParams = new URLSearchParams(window.location.search);
    const iban = urlParams.get('iban');
    if (iban) transactionsController.find(iban);
});