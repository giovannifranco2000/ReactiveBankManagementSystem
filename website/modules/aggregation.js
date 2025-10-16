import { default as reactor } from "/website/modules/reactive.js";
import { default as HTTPRequest } from "/website/modules/http.js";
import { Account, AccountHolder } from "/website/modules/entities.js";

// sends HTTP requests
export class AccountsDao {

    create(JSONObject) {
        HTTPRequest.post("accounts", JSONObject);
    }

    // handles both readAll and readById requests (overloading)
    read(id) {
        return id === undefined ? HTTPRequest.get("accounts") : HTTPRequest.get("accounts", id);
    }

    // IMPLEMENT: handles both HTTP put and patch requests (overloading)
    update(account) {
        HTTPRequest.put("accounts", account);
    }

    delete(id) {
        HTTPRequest.delete("accounts", id);
    }

}

let accountsDao = new AccountsDao();

// handles 
export class AccountsService {

    // IMPLEMENT: lazy loading -> 
    // if list was already populated, there is no need to request the database for it again
    // all new changes will be done in frontend directly and insert/update requests will be sent to db
    // bonus: update logic should be handled directly by the database: services are a high-level entity
    // might need a dao
    _accounts = {};

    // IMPLEMENT: assign objects using reflection from the reflection.js module
    get() {

        if(Object.keys(this._accounts).length <= 0) {
            let savedAccounts = dtoHandler.getItem("accounts");
            if(savedAccounts !== null) {
                savedAccounts.forEach(account => {
                    account = Object.assign(new Account(), account);
                    account.accountHolder = Object.assign(new AccountHolder(), account.accountHolder);
                    this._accounts[account.id] = account;
                });
            }
        }

    }

    // handles both create and update requests
    put(account) {
        accountsDao.update(account);
    }

    delete(id) {
        accountsDao.delete(id);
    }

}

export class AccountsController {

    _accounts;

    constructor() {
        this._accounts = {};
        let savedAccounts = localStorage.getItem("accounts");
        if(savedAccounts !== null) {
            savedAccounts = JSON.parse(savedAccounts);
            savedAccounts.forEach(account => {
                account = Object.assign(new Account(), account);
                account.accountHolder = Object.assign(new AccountHolder(), account.accountHolder);
                this._accounts[account.id] = account;
            });
        }
        reactor.registerEvent("render_account");
    }

    get accounts() {
        return this._accounts;
    }

    save(account) {
        this._accounts[account.id] = account;
        reactor.dispatchEvent("render_account", account);
    }

    remove(id) {
        delete this._accounts[id];
        reactor.dispatchEvent("render_account");
    }

    find(id) {
        return this._accounts[id];
    }

    // IMPLEMENT: filter by what? by AccountHolder?
    filter() {
        // renders the filtered list
    }

}

let accountsController = new AccountsController();
export default accountsController;

export class AccountsView {
    
    _container;
    _accountList;

    constructor(accountList) {
        this._container = document.querySelector(".account-list");
        this._accountList = accountsController;
        reactor.addEventListener("render_account", () => this.renderAll());
    }

    get container() {
        return this._container;
    }

    set container(container) {
        this._container = container;
    }

    get accountList() {
        return this._accountList;
    }

    renderAdd(account) {

    }

    renderAll() {
        this.container.innerHTML = "";

        let row1 = document.createElement("div");
        row1.classList.add("row");
        let colFirstName1 = document.createElement("div");
        colFirstName1.classList.add("col-3");
        colFirstName1.textContent = "NOME";
        let colLastName1 = document.createElement("div");
        colLastName1.classList.add("col-3");
        colLastName1.textContent = "COGNOME";
        let colDateOfBirth1 = document.createElement("div");
        colDateOfBirth1.classList.add("col-3");
        colDateOfBirth1.textContent = "DATA DI NASCITA";
        let emptyColumn = document.createElement("div");
        colDateOfBirth1.classList.add("col-3");

        row1.appendChild(colFirstName1);
        row1.appendChild(colLastName1);
        row1.appendChild(colDateOfBirth1);
        row1.appendChild(emptyColumn);

        this._container.append(row1);

        Object.entries(accountsController.accounts).forEach(([id, account]) => {
            let row = document.createElement("div");
            row.classList.add("row");
            let colFirstName = document.createElement("div")
            colFirstName.classList.add("col-3");
            colFirstName.textContent = account.accountHolder.firstName;
            let colLastName = document.createElement("div")
            colLastName.classList.add("col-3");
            colLastName.textContent = account.accountHolder.lastName;
            let colDateOfBirth = document.createElement("div")
            colDateOfBirth.classList.add("col-3");
            colDateOfBirth.textContent = account.accountHolder.dateOfBirth;
            let buttonColumn = document.createElement("div")
            buttonColumn.classList.add("col-3");
            let button = document.createElement("button");
            button.addEventListener("click", () => {
                accountList.remove(account.id);
            });
            buttonColumn.appendChild(button);

            row.appendChild(colFirstName);
            row.appendChild(colLastName);
            row.appendChild(colDateOfBirth);
            row.appendChild(buttonColumn);

            this._container.append(row);
        })
    }

}