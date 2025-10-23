// import { default as reactor } from "/modules/js_framework/reactive.js";
import { Database } from "/modules/js_framework/database.js";

export class Api {

    // SINGLETON
    static #_instance;

    constructor() {
        if(Api.#_instance) throw new Error("Cannot instantiate multiple instances of " + this.constructor.name);
        Api.#_instance = this;
    }

    static get instance() {
        if(!Api.#_instance) Api.#_instance = new Api();
        return Api.#_instance;
    }

    #_database = Database.instance;

    // routes handle methods follow naming conventions: methodName + urlMapping
    // IMPLEMENT: route params
    routes = {
        "get": {
            "/api/account-details": this.getAccountDetails,
            "/api/transactions": this.getTransactionList
        },
        "post": {
            "/api/account-details": this.postAccountDetails
        },
        "put": {

        },
        "delete": {
            "/api/account-details": this.deleteAccountDetails
        },
        "patch": {

        }
    }

    // IMPLEMENT: reactive mapping
    // map() {
    //     reactor.addEventListener("http", (event, httpRequest) => {
    //         routes[httpRequest.method][httpRequest.url]();
    //     });
    // }

    // IMPLEMENT: must find a better way to deal with this issue
    cleanQueryResult(result, table1Name, table2Name) {
        result.forEach((row) => {
            Object.keys(row).forEach((oldKey) => {
                let newKey = oldKey.replaceAll(table1Name + "_", "").replaceAll(table2Name + "_", "");
                row[newKey] = row[oldKey];
                delete row[oldKey];
            });
        });
        return result;
    }

    getAccountDetails() {
        return this.cleanQueryResult(this.#_database.select(
            "select " +
                "accounts.id, " +
                "account_holders.first_name, " +
                "account_holders.last_name, " +
                "account_holders.date_of_birth, " +
                "account_holders.birthplace, " +
                "account_holders.gender, " + 
                "account_holders.address, " +
                "account_holders.document_type, " +
                "account_holders.document_id, " +
                "account_holders.cellphone, " +
                "account_holders.email, " +
                "account_holders.cf, " +
                "accounts.iban, " +
                "accounts.branch, " +
                "accounts.balance, " +
                "accounts.status " +
            "from accounts " +
                "join account_holders " +
                "on accounts.account_holder = account_holders.id"
        ), "accounts", "account_holders");
    }

    getTransactionList(iban) {
        return this.#_database.select(
            "select " +
                "transactions.id, " +
                "transactions.remitter_iban, " +
                "transactions.beneficiary_iban, " +
                "transactions.amount, " +
                "transactions.transaction_date, " +
                "transactions.status " +
            "from transactions " +
            "where " +
                "( transactions.remitter_iban = accounts.iban ) or " +
                "( transactions.beneficiary_iban = accounts.iban )",
            iban
        );
    }

    postAccountDetails(object) {
        // IMPLEMENT: I'm supposing a new Account is linked to a new AccountHolder
        // in the future, I should have the user choose from a list of existing account holders 
        let accountHolderId = this.#_database.insert(
            "insert ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? " +
            "from account_holders " +
            "set " +
                "account_holders.first_name, " +
                "account_holders.last_name, " +
                "account_holders.date_of_birth, " +
                "account_holders.birthplace, " +
                "account_holders.gender, " + 
                "account_holders.address, " +
                "account_holders.document_type, " +
                "account_holders.document_id, " +
                "account_holders.cellphone, " +
                "account_holders.email, " +
                "account_holders.cf",
            object.first_name,
            object.last_name,
            object.date_of_birth,
            object.birthplace,
            object.gender,
            object.address,
            object.document_type,
            object.document_id,
            object.cellphone,
            object.email,
            object.cf
        );

        return this.#_database.insert(
            "insert ?, ?, ?, ?, ? " +
            "from accounts " +
            "set " +
                "accounts.iban, " +
                "accounts.branch, " +
                "accounts.balance, " +
                "accounts.status, " +
                "accounts.account_holder",
            object.iban,
            object.branch,
            object.balance,
            object.status,
            accountHolderId
        );
    }

    deleteAccountDetails(id) {
        this.#_database.delete(
            "delete " +
            "from accounts " +
            "where accounts.id = ?",
            id
        );
    }

}

export default Api.instance;