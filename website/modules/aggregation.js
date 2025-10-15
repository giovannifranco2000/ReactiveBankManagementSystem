import { Account, AccountHolder } from "/website/modules/entities.js";
import { default as reactor } from "/website/modules/reactive.js";

export class AccountList {

    _accounts;

    constructor() {
        this._accounts = new Array();
        let savedAccounts = localStorage.getItem("accounts");
        if(savedAccounts !== null) {
            savedAccounts = JSON.parse(savedAccounts);
            savedAccounts.forEach(account => {
                account = Object.assign(new Account(), account);
                account.accountHolder = Object.assign(new AccountHolder(), account.accountHolder);
                this._accounts.push(account);
            });
        }
    }

    get accounts() {
        return this._accounts;
    }

    add(account) {
        this._accounts.push(account);
        reactor.registerEvent("render_account");
        reactor.dispatchEvent("render_account", account);
    }

    remove(id) {
        
    }

}

export class AccountListHTML {
    
    _container;
    _accountList;

    constructor(accountList) {
        this._container = document.querySelector(".account-list");
        this._accountList = accountList;
        reactor.addEventListener(() => this.render());
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

    render() {
        this.container.innerHTML = "";

        let row1 = document.createElement("div");
        row1.classList.add("row");
        let colId1 = document.createElement("div");
        colId1.classList.add("col-3");
        colId1.textContent = "ID";
        let colFirstName1 = document.createElement("div");
        colFirstName1.classList.add("col-3");
        colFirstName1.textContent = "NOME";
        let colLastName1 = document.createElement("div");
        colLastName1.classList.add("col-3");
        colLastName1.textContent = "COGNOME";
        let colDateOfBirth1 = document.createElement("div");
        colDateOfBirth1.classList.add("col-3");
        colDateOfBirth1.textContent = "DATA DI NASCITA";

        row1.appendChild(colId1);
        row1.appendChild(colFirstName1);
        row1.appendChild(colLastName1);
        row1.appendChild(colDateOfBirth1);

        this._container.append(row1);

        this.accountList.accounts.forEach((account) => {
            let row = document.createElement("div");
            row.classList.add("row");
            let colId = document.createElement("div")
            colId.classList.add("col-3");
            colId.textContent = account.id;
            let colFirstName = document.createElement("div")
            colFirstName.classList.add("col-3");
            colFirstName.textContent = account.accountHolder.firstName;
            let colLastName = document.createElement("div")
            colLastName.classList.add("col-3");
            colLastName.textContent = account.accountHolder.lastName;
            let colDateOfBirth = document.createElement("div")
            colDateOfBirth.classList.add("col-3");
            colDateOfBirth.textContent = account.accountHolder.dateOfBirth;

            row.appendChild(colId);
            row.appendChild(colFirstName);
            row.appendChild(colLastName);
            row.appendChild(colDateOfBirth);

            this._container.append(row);
        })
    }

}