import { Account, AccountHolder } from "/website/modules/entities.js";
import { default as accountsController } from "/website/modules/aggregation.js";

class Form {

    #form;

    constructor(formNodeCallback, constructCallback) {
        this.#form = formNodeCallback() ?? document.querySelector("form");
        this.onSubmit(constructCallback);
    }

    get form() {
        return this.#form;
    }

    onSubmit(constructCallback) {
        this.#form.addEventListener("submit", (event) => {
            event.preventDefault();
            let formData = new FormData(event.target);
            accountsController.save(constructCallback(formData))
        })
    }

}

export class AccountForm extends Form {

    constructor() {
        // IMPLEMENT: this structure reminds me a lot of Promise Chaining.
        // Could I use Promises to obtain the same result?
        super(
            () => document.querySelector("form.account-form"),
            (formData) => {
                return new Account(
                    new AccountHolder(
                        formData.get("first-name"),
                        formData.get("last-name"),
                        formData.get("date-of-birth")
                    )
                );
            }
        );
    }

}