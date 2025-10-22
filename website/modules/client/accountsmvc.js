import { default as reactor } from "/modules/js_framework/reactive.js";
import { default as HTTPRequest } from "/modules/js_framework/http.js";
import { Factory } from "/modules/js_framework/reflective.js";
import { AccountDetailsDto } from "/modules/client/dtos.js";
import { DaoInterface, ServiceInterface, ControllerInterface } from "/modules/js_framework/mvc.js";

// IMPLEMENT: CACHE -> already made account queries should be handled by cache
// a cache associates the url of a get/post request to the data received,
// so that there won't be a need to request data from the database each time the page is refreshed
// I'll also need a refresh button, to request the database for an updated list of accounts
// (the database might be manipulated by multiple sources at the same time)
// #_accounts in AccountsService will be replaced by the cache

// sends HTTP requests
class AccountsDao extends DaoInterface {

    // SINGLETON
    static #_instance;

    constructor() {
        super();
        if(AccountsDao.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        AccountsDao.#_instance = this;
    }

    static get instance() {
        if(!AccountsDao.#_instance) AccountsDao.#_instance = new AccountsDao();
        return AccountsDao.#_instance;
    }

    create(account) {
        account.id = HTTPRequest.post("/api/accounts", account.toJSON());
    }

    // given the current state of the application, there's no need to decouple accounts from account_holders
    /* 
        select
            ac.*,
            ah.*
        from
            accounts ac
            inner join account_holders ah
            on ac.account_holder = ah.id;
    */
    /* MY SYNTAX:
        select
        from
            accounts
            join account_holders
            on accounts.id = account_holders.id
    */
    // handles both readAll() and readById() (overload)
    read(id) {
        return id === undefined ? HTTPRequest.get("/api/accounts") : HTTPRequest.get("/api/accounts", id)[id];
    }

    // IMPLEMENT: handles both HTTP put and patch requests (overload)
    update(account) {
        HTTPRequest.put("/api/accounts", account.toJSON());
    }

    // IMPLEMENT: cannot delete an account, must set its status to closed
    delete(id) {
        HTTPRequest.delete("/api/accounts", id);
    }

}

// converts objects and implements business logic
class AccountsService extends ServiceInterface {

    // SINGLETON
    static #_instance;

    constructor() {
        super();
        if(AccountsService.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        AccountsService.#_instance = this;
    }

    static get instance() {
        if(!AccountsService.#_instance) AccountsService.#_instance = new AccountsService();
        return AccountsService.#_instance;
    }

    #_accountsDao = AccountsDao.instance;
    // LAZY LOADING -> request the database for data once only
    // serves as cache
    #_accounts = {};

    #load() {
        // IMPLEMENT: assign objects using reflection from the reflective.js module
        // eager loading: all throughout the application,
        // accounts are always paired with their holders
        Object.values(this.#_accountsDao.read()).forEach(account => {
            this.#_accounts[account.id] = Factory.fromJSON(AccountDetailsDto, account);
        });
    }

    // handles both getAll() and getById() (overload)
    get(id) {
        // _accounts is empty: request data from database
        if(Object.keys(this.#_accounts).length <= 0) this.#load();
        return id === undefined ? this.#_accounts : this.#_accounts[id];
    }

    // handles both create and update requests
    put(account) {
        // instead of implementing validation logic, takes advantage of server-based logic
        // might cause longer refresh times on a real client-server architecture
        try {
            if(account) {
                (!account.id) ? this.#_accountsDao.create(account) : this.#_accountsDao.update(account);
                this.#_accounts[account.id] = account;
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
            this.#_accountsDao.delete(id);
            delete this.#_accounts[id];
        } catch(error) {
            // IMPLEMENT: error handling logic (e.g. show error in DOM)
            console.error(error.message);
        }
    }

}

// handles data through services, prompts views for changes, dispatches events to change detection
// DEBUG: error handling?
class AccountsController extends ControllerInterface {

    // SINGLETON
    static #_instance;

    constructor() {
        super();
        if(AccountsController.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        AccountsController.#_instance = this;
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
        if(!AccountsController.#_instance) AccountsController.#_instance = new AccountsController();
        return AccountsController.#_instance;
    }

    #_accountsService = AccountsService.instance;
    #_accountsView = AccountsView.instance;

    #removeButtonCallback;
    #transactionButtonCallback;

    save(account) {
        console.log(account)
        this.#_accountsService.put(account);

        reactor.dispatchEvent(
            "render_accounts",
            this.#_accountsView.newAccountNode(account, this.#removeButtonCallback)
        );

        reactor.dispatchEvent(
            "render_transactions",
            // IMPLEMENT
            () => {}
        )
    }

    remove(id) {
        this.#_accountsService.delete(id);
        reactor.dispatchEvent("render_accounts", id);
    }

    find(id) {
        reactor.dispatchEvent(
            "render_accounts",
            this.#_accountsView.newAccountNodeList(this.#_accountsService.get(id), this.#removeButtonCallback)
        );

        reactor.dispatchEvent(
            "render_transactions",
            // IMPLEMENT
            () => {}
        )
    }

    // IMPLEMENT: filter by what? by AccountHolder?
    filter() {
        // renders the filtered list
    }

}

class AccountsView {

    // SINGLETON
    static #_instance;

    constructor() {
        if(AccountsView.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        AccountsView.#_instance = this;
    }

    static get instance() {
        if(!AccountsView.#_instance) AccountsView.#_instance = new AccountsView();
        return AccountsView.#_instance;
    }

    #genericAccountNode(dataId, ...colContents) {
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

    newAccountNode(account, removeButtonCallback, transactionButtonCallback) {
        let removeButton = document.createElement("button");
        removeButton.classList.add("button");
        removeButton.textContent = "ELIMINA";
        removeButton.addEventListener("click", () => removeButtonCallback(account.id));

        let transactionButton = document.createElement("button");
        transactionButton.classList.add("button");
        transactionButton.textContent = "VISUALIZZA TRANSAZIONI";
        transactionButton.addEventListener("click", () => transactionButtonCallback(account.iban));

        return this.#genericAccountNode(
            account.id,
            account.first_name,
            account.last_name,
            account.date_of_birth,
            account.birthplace,
            account.gender,
            account.address,
            account.document_type,
            account.document_id,
            account.cellphone,
            account.email,
            account.cf,
            account.iban,
            account.branch,
            account.balance,
            account.status,
            removeButton,
            transactionButton
        );
    }

    newAccountNodeList(accounts, removeButtonCallback, transactionButtonCallback) {
        const FIELD_NAMES = [
            "NOME",
            "COGNOME",
            "DATA DI NASCITA",
            "LUOGO DI NASCITA",
            "GENERE",
            "INDIRIZZO",
            "DOCUMENTO",
            "NUMERO DOCUMENTO",
            "CELLULARE",
            "EMAIL",
            "CODICE FISCALE",
            "IBAN",
            "FILIALE",
            "SALDO",
            "STATO",
            "",
            ""
        ]
        let nodes = new Array(this.#genericAccountNode("", ...FIELD_NAMES));
        Object.values(accounts).forEach((account) => nodes.push(this.newAccountNode(account, removeButtonCallback, transactionButtonCallback)));
        return nodes;
    }

}

export default AccountsController.instance;