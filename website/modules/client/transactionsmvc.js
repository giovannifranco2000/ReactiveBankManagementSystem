import { default as reactor } from "/modules/js_framework/reactive.js";
import { default as HTTPRequest } from "/modules/js_framework/http.js";
import { Factory } from "/modules/js_framework/reflective.js";
import { TransactionsDto } from "/modules/client/dtos.js";
import { DaoInterface, ServiceInterface, ControllerInterface } from "/modules/js_framework/mvc.js";

// IMPLEMENT: CACHE -> already made transaction queries should be handled by cache
// a cache associates the url of a get/post request to the data received,
// so that there won't be a need to request data from the database each time the page is refreshed
// I'll also need a refresh button, to request the database for an updated list of transactions
// (the database might be manipulated by multiple sources at the same time)
// #_transactions in TransactionsService will be replaced by the cache

// sends HTTP requests
class TransactionsDao extends DaoInterface {

    // SINGLETON
    static #_instance;

    constructor() {
        super();
        if(TransactionsDao.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        TransactionsDao.#_instance = this;
    }

    static get instance() {
        if(!TransactionsDao.#_instance) TransactionsDao.#_instance = new TransactionsDao();
        return TransactionsDao.#_instance;
    }
    
    // handles readByAccount()
    read(iban) {
        return HTTPRequest.get("/api/transactions", iban);
    }

    // IMPLEMENT: handles both HTTP put and patch requests (overload)
    update(transaction) {
        HTTPRequest.put("/api/transactions", transaction.toJSON());
    }

}

// converts objects and implements business logic
class TransactionsService extends ServiceInterface {

    // SINGLETON
    static #_instance;

    constructor() {
        super();
        if(TransactionsService.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        TransactionsService.#_instance = this;
    }

    static get instance() {
        if(!TransactionsService.#_instance) TransactionsService.#_instance = new TransactionsService();
        return TransactionsService.#_instance;
    }

    #_transactionsDao = TransactionsDao.instance;
    // #_accountsService = AccountsService.instance;
    // LAZY LOADING -> request the database for data once only
    // represents the transactions associated to the account searched
    // serves as cache
    #_transactions = {};

    #load(iban) {
        // IMPLEMENT: assign objects using reflection from the reflective.js module
        // eager loading: while in the transaction page,
        // transactions are always paired with their holders
        const ids = [];
        this.#_transactionsDao.read(iban).forEach(transaction => {
            ids.push(transaction.id);
            this.#_transactions[transaction.id] = Factory.fromJSON(TransactionsDto, transaction);
        });
        return ids;
    }

    // handles both getAll() and getById() (overload)
    get(iban) {
        const ids = this.#load(iban);
        // DEBUG: temporary solution, because gql parser cuts parts off iban
        const transactions = [];
        ids.forEach((id) => transactions.push(this.#_transactions[id]))
        return transactions;
    }

    // handles both create and update requests
    put(account) {
        // instead of implementing validation logic, takes advantage of server-based logic
        // might cause longer refresh times on a real client-server architecture
        try {
            if(account !== null) {
                account.id === null ? this.#_transactionsDao.create(account) : this.#_transactionsDao.update(account);
                this.#_transactions[account.id] = account;
            }
        } catch(error) {
            // IMPLEMENT: error handling logic (e.g. show error in DOM)
            console.error(error.message);
        }
    }

    // IMPLEMENT: there should be search functionalities in AccountsService, as well
    filter(accountHolderName) {
        // let account = this.#_accountsService.filter(accountHolderName);
        // this.get(account.id);
    }

}

// handles data through services, prompts views for changes, dispatches events to change detection
// DEBUG: error handling?
class TransactionsController extends ControllerInterface {

    // SINGLETON
    static #_instance;

    constructor() {
        super();
        if(TransactionsController.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        TransactionsController.#_instance = this;
        // IMPLEMENT: should redirect to transactions page and show associated transactions
        reactor.registerEvent("render_transactions");
        reactor.registerEvent("render_accounts");
        this.#cancelButtonCallback = (iban) => {};
    }

    static get instance() {
        if(!TransactionsController.#_instance) TransactionsController.#_instance = new TransactionsController();
        return TransactionsController.#_instance;
    }

    #_transactionsService = TransactionsService.instance;
    #_transactionsView = TransactionsView.instance;

    #cancelButtonCallback;

    save(account) {
        this.#_transactionsService.put(account);

        reactor.dispatchEvent(
            "render_transactions",
            // IMPLEMENT
            () => {}
        )
    }

    find(iban) {
        reactor.dispatchEvent(
            "render_transactions",
            this.#_transactionsView.newTransactionNodeList(this.#_transactionsService.get(iban), this.#cancelButtonCallback)
        );
    }

    search(accountHolderName) {
        let transactions = this.#_transactionsService.filter(accountHolderName);
        reactor.dispatchEvent(
            "render_transactions",
            // IMPLEMENT
            () => {}
        )
    }

}

class TransactionsView {

    // SINGLETON
    static #_instance;

    constructor() {
        if(TransactionsView.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        TransactionsView.#_instance = this;
    }

    static get instance() {
        if(!TransactionsView.#_instance) TransactionsView.#_instance = new TransactionsView();
        return TransactionsView.#_instance;
    }

    #genericTransactionNode(dataId, ...colContents) {
        let row = document.createElement("tr");
        if(dataId) row.dataset.id = dataId;

        for(const colContent of colContents) {
            const col = document.createElement("td");
            colContent instanceof HTMLElement ? 
            col.appendChild(colContent) :
            col.textContent = colContent;
            row.appendChild(col);
        }

        return row;
    }

    newTransactionNode(transaction, cancelButtonCallback) {
        let cancelButton = document.createElement("button");
        cancelButton.classList.add("button");
        cancelButton.textContent = "ANNULLA";
        cancelButton.addEventListener("click", () => cancelButtonCallback(transaction.iban));

        return this.#genericTransactionNode(
            transaction.id,
            transaction.remitter_iban,
            transaction.beneficiary_iban,
            transaction.amount,
            transaction.transaction_date,
            transaction.status,
            cancelButton
        );
    }

    newTransactionNodeList(transactions, cancelButtonCallback) {
        const FIELD_NAMES = [
            "ORDINANTE",
            "BENEFICIARIO",
            "IMPORTO",
            "DATA",
            "STATO",
            ""
        ]
        let nodes = new Array(this.#genericTransactionNode("", ...FIELD_NAMES));
        transactions.forEach((transaction) => nodes.push(this.newTransactionNode(transaction, cancelButtonCallback)));
        return nodes;
    }

}

export default TransactionsController.instance;