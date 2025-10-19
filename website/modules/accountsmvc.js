import { default as reactor } from "/website/modules/reactive.js";
import { default as HTTPRequest } from "/website/modules/http.js";
import { Account, AccountHolder } from "/website/modules/entities.js";
import { DaoInterface, ServiceInterface, ControllerInterface } from "/website/modules/mvc.js";

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
        HTTPRequest.post("accounts", account);
    }

    // handles both readAll() and readById() (overload)
    read(id) {
        return id === undefined ? HTTPRequest.get("accounts") : HTTPRequest.get("accounts", id)[id];
    }

    // IMPLEMENT: handles both HTTP put and patch requests (overload)
    update(account) {
        HTTPRequest.put("accounts", account);
    }

    delete(id) {
        HTTPRequest.delete("accounts", id);
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
    #_accounts = {};

    #load() {
        // IMPLEMENT: assign objects using reflection from the reflective.js module
        Object.values(this.#_accountsDao.read()).forEach(account => {
            account = Object.assign(new Account(), account);
            account.accountHolder = Object.assign(new AccountHolder(), account.accountHolder);
            this.#_accounts[account.id] = account;
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
            if(account !== null) {
                account.id === null ? this.#_accountsDao.create(account) : this.#_accountsDao.update(account);
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
        this.#removeCallback = (id) => this.remove(id);
    }

    static get instance() {
        if(!AccountsController.#_instance) AccountsController.#_instance = new AccountsController();
        return AccountsController.#_instance;
    }

    #_accountsService = AccountsService.instance;
    #_accountsView = AccountsView.instance;

    #removeCallback;

    save(account) {
        this.#_accountsService.put(account);

        reactor.dispatchEvent(
            "render_accounts",
            this.#_accountsView.newAccountNode(account, this.#removeCallback)
        );
    }

    remove(id) {
        this.#_accountsService.delete(id);
        reactor.dispatchEvent("render_accounts", id);
    }

    find(id) {
        reactor.dispatchEvent(
            "render_accounts",
            this.#_accountsView.newAccountNodeList(this.#_accountsService.get(id), this.#removeCallback)
        );
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

    #genericAccountNode(dataId, col1Content, col2Content, col3Content, col4Content) {
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

        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        row.appendChild(col4);

        return row;
    }

    newAccountNode(account, buttonCallback) {
        let button = document.createElement("button");
        button.textContent = "ELIMINA"
        button.addEventListener("click", () => buttonCallback(account.id));

        return this.#genericAccountNode(
            account.id,
            account.accountHolder.firstName,
            account.accountHolder.lastName,
            account.accountHolder.dateOfBirth,
            button
        );
    }

    newAccountNodeList(accounts, buttonCallback) {
        let nodes = new Array(this.#genericAccountNode("", "NOME", "COGNOME", "DATA DI NASCITA", ""));
        Object.values(accounts).forEach((account) => nodes.push(this.newAccountNode(account, buttonCallback)));
        return nodes;
    }

}

export default AccountsController.instance;