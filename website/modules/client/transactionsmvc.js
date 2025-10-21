import { default as reactor } from "/modules/js_framework/reactive.js";
import { default as HTTPRequest } from "/modules/js_framework/http.js";
import { Factory } from "/modules/js_framework/reflective.js";
import { Transaction } from "/modules/js_framework/entities.js";
import { DaoInterface, ServiceInterface, ControllerInterface } from "/modules/js_framework/mvc.js";
import { AccountsService } from "/modules/js_framework/accountsmvc.js";

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
    
    /* 
        select t.*
        from
            accounts a
            inner join transactions t
            on a.iban = t.remitter_iban or a.iban = t.beneficiary_iban
        where a.id = ?;
    */
    /* MY SYNTAX:
        select
            transactions.remitter_iban,
            transactions.beneficiary_iban,
            transactions.amount,
            transactions.transaction_date,
            transactions.status
        from
            accounts
            join transactions
            on 
                accounts.iban = transactions.remitter_iban or
                accounts.iban = transactions.beneficiary_iban
        where accounts.id = ?
    */
    // handles readByAccount()
    read(id) {
        return HTTPRequest.get("/api/transactions", id)[id];
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
    #_accountsService = AccountsService.instance;
    // LAZY LOADING -> request the database for data once only
    // represents the transactions associated to the account searched
    // serves as cache
    #_transactions = {};

    #load(id) {
        // IMPLEMENT: assign objects using reflection from the reflective.js module
        // eager loading: while in the transaction page,
        // transactions are always paired with their holders
        Object.values(this.#_transactionsDao.read(id)).forEach(transaction => {
            this.#_transactions[transaction.id] = Factory.fromJSON(Transaction, transaction);
        });
    }

    // handles both getAll() and getById() (overload)
    get(id) {
        // _transactions is empty: request data from database
        if(Object.keys(this.#_transactions).length <= 0) this.#load(id);
        return id === undefined ? this.#_transactions : this.#_transactions[id];
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

    delete(id) {
        // instead of implementing validation logic, takes advantage of server-based logic
        // might cause longer refresh times on a real client-server architecture
        try {
            this.#_transactionsDao.delete(id);
            delete this.#_transactions[id];
        } catch(error) {
            // IMPLEMENT: error handling logic (e.g. show error in DOM)
            console.error(error.message);
        }
    }

    // IMPLEMENT: there should be search functionalities in AccountsService, as well
    filter(accountHolderName) {
        let account = this.#_accountsService.filter(accountHolderName);
        this.get(account.id);
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
        // IMPLEMENT: when I turn the website into a Single Page Application,
        // the event will be registered directly in the constructor of ChangeDetection,
        // for proper incapsulation
        reactor.registerEvent("render_accounts");
        reactor.registerEvent("render_transactions");
        this.#removeButtonCallback = (id) => this.remove(id);
        // IMPLEMENT: should redirect to transactions page and show associated transactions
        this.#transactionButtonCallback = (iban) => {};
    }

    static get instance() {
        if(!TransactionsController.#_instance) TransactionsController.#_instance = new TransactionsController();
        return TransactionsController.#_instance;
    }

    #_transactionsService = TransactionsService.instance;
    #_transactionsView = TransactionsView.instance;

    #removeButtonCallback;
    #transactionButtonCallback;

    save(account) {
        this.#_transactionsService.put(account);

        reactor.dispatchEvent(
            "render_accounts",
            this.#_transactionsView.newAccountNode(account, this.#removeButtonCallback)
        );

        reactor.dispatchEvent(
            "render_transactions",
            // IMPLEMENT
            () => {}
        )
    }

    remove(id) {
        this.#_transactionsService.delete(id);
        reactor.dispatchEvent("render_accounts", id);
    }

    find(id) {
        reactor.dispatchEvent(
            "render_accounts",
            this.#_transactionsView.newAccountNodeList(this.#_transactionsService.get(id), this.#removeButtonCallback)
        );

        reactor.dispatchEvent(
            "render_transactions",
            // IMPLEMENT
            () => {}
        )
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

    #genericAccountNode(dataId, col1Content, col2Content, col3Content, col4Content, col5Content) {
        let row = document.createElement("div");
        row.classList.add("row");
        if(dataId) row.dataset.id = dataId;

        let col1 = document.createElement("div")
        col1.classList.add("col-3");
        col1Content instanceof HTMLElement ? 
        col1.appendChild(col1Content) :
        col1.textContent = col1Content;

        let col2 = document.createElement("div")
        col2.classList.add("col-3");
        col2Content instanceof HTMLElement ? 
        col2.appendChild(col2Content) : 
        col2.textContent = col2Content;

        let col3 = document.createElement("div")
        col3.classList.add("col-3");
        col3Content instanceof HTMLElement ? 
        col3.appendChild(col3Content) : 
        col3.textContent = col3Content;

        let col4 = document.createElement("div")
        col4.classList.add("col-3");
        col4Content instanceof HTMLElement ? 
        col4.appendChild(col4Content) : 
        col4.textContent = col4Content;

        let col5 = document.createElement("div")
        col5.classList.add("col-3");
        col5Content instanceof HTMLElement ? 
        col5.appendChild(col5Content) : 
        col5.textContent = col5Content;

        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        row.appendChild(col4);

        return row;
    }

    newAccountNode(account, removeButtonCallback, transactionButtonCallback) {
        let removeButton = document.createElement("button");
        removeButton.textContent = "ELIMINA";
        removeButton.addEventListener("click", () => removeButtonCallback(account.id));

        let transactionButton = document.createElement("button")
        transactionButton.textContent = "VISUALIZZA TRANSAZIONI";
        transactionButton.addEventListener("click", () => transactionButtonCallback(account.iban));

        return this.#genericAccountNode(
            account.id,
            account.account_holder.first_name,
            account.account_holder.last_name,
            account.account_holder.date_of_birth,
            removeButton,
            transactionButton
        );
    }

    newAccountNodeList(accounts, removeButtonCallback, transactionButtonCallback) {
        let nodes = new Array(this.#genericAccountNode("", "NOME", "COGNOME", "DATA DI NASCITA", "", ""));
        Object.values(accounts).forEach((account) => nodes.push(this.newAccountNode(account, removeButtonCallback, transactionButtonCallback)));
        return nodes;
    }

}

export default TransactionsController.instance;