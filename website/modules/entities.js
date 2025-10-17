export class AccountHolder {
    _firstName;
    _lastName;
    _dateOfBirth;

    constructor(firstName, lastName, dateOfBirth) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._dateOfBirth = dateOfBirth;
    }

    get firstName() {
        return this._firstName;
    }

    set firstName(firstName) {
        this._firstName = firstName;
    }

    get lastName() {
        return this._lastName;
    }

    set lastName(lastName) {
        this._lastName = lastName;
    }

    get dateOfBirth() {
        return this._dateOfBirth;
    }

    set dateOfBirth(dateOfBirth) {
        this._dateOfBirth = dateOfBirth;
    }
}

class Entity {
    static ids = 0;
    _id

    constructor() {
        this._id = ++Entity.ids;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }
}

export class Account extends Entity {
    _accountHolder;

    constructor(accountHolder) {
        super();
        this._accountHolder = accountHolder;
    }

    get accountHolder() {
        return this._accountHolder;
    }

    set accountHolder(accountHolder) {
        this._accountHolder = accountHolder;
    }
}

export class Transaction extends Entity {
    #date;
    #idRemitterAccount;
    #idBeneficiaryAccount;

    constructor(date, idStartingAccount, idFinalAccount) {
        super();
        this.#date = date;
        this.#idStartingAccount = idStartingAccount;
        this.#idFinalAccount = idFinalAccount;
    }

    get date() {
        return this.#date;
    }

    set date(date) {
        this.#date = date;
    }

    get idStartingAccount() {
        return this.#idStartingAccount;
    }

    set idStartingAccount(idStartingAccount) {
        this.#idStartingAccount = idStartingAccount;
    }

    get idFinalAccount() {
        return this.#idFinalAccount;
    }

    set idFinalAccount(idFinalAccount) {
        this.#idFinalAccount = idFinalAccount;
    }
}