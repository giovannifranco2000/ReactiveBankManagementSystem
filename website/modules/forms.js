import { Account, AccountHolder } from "/website/modules/entities.js";
import { default as accountController } from "/website/modules/aggregation.js";

class Form {
    #inputArray;
    #submitButton;

    constructor() {
        this.#inputArray = document.querySelectorAll(".form-input");
        this.#submitButton = document.querySelector(".submit-button");
    }

    get inputArray() {
        return this.#inputArray;
    }

    get submitButton() {
        return this.#submitButton;
    }
}

export class AccountForm extends Form {

    constructor() {
        super();
        super.submitButton.addEventListener("click", () => {
            
            let accounts = localStorage.getItem("accounts");
            if(accounts !== null) accounts = JSON.parse(accounts);

            let account = new Account(
                new AccountHolder(
                    // firstName
                    super.inputArray[0].value,
                    // lastName
                    super.inputArray[1].value,
                    // dateOfBirth
                    super.inputArray[2].value,
                )
            );

            if(accounts === null) localStorage.setItem("accounts", JSON.stringify(new Array(account)));
            else {
                accounts.push(account);
                localStorage.setItem("accounts", JSON.stringify(accounts));
            }

            accountList.add(account);
        });
    }

}