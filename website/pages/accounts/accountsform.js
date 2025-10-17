import { Form } from "/website/modules/forms.js";
import { Account, AccountHolder } from "/website/modules/entities.js";

import { default as accountsController } from "/website/pages/accounts/accountsmvc.js";

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
            },
            (object) => accountsController.save(object)
        );
    }

}
