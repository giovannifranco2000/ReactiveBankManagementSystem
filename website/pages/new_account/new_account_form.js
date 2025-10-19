import { FormInterface } from "/website/modules/forms.js";
import { Account, AccountHolder } from "/website/modules/entities.js";
import { default as accountsController } from "/website/modules/accountsmvc.js";

// TEMPLATE METHOD ANTI-PATTERN (ASYNCHRONOUS) (see forms.js)
// PROTOTYPE REFLECTION (see abstractive.js)

export class AccountForm extends FormInterface {

    constructor() {
        super(() => document.querySelector("form.account-form"));
    }

    async onSubmit(formData) {
        const model = new Account(
            formData.get("account-id"),
            formData.get("iban"),
            formData.get("account-number"),
            formData.get("branch"),
            new AccountHolder(
                formData.get("account-holder-id"),
                formData.get("first-name"),
                formData.get("last-name"),
                formData.get("date-of-birth")
            )
        )
        return Promise.resolve(accountsController.save(model));
    }

}

// OTHER WAYS TO ACHIEVE THE SAME RESULT:

// TEMPLATE METHOD ANTI-PATTERN (SYNCHRONOUS) (see forms.js)
// PROTOTYPE REFLECTION (see abstractive.js - Interface v.1.0)

/* export class AccountForm extends FormInterface {

    constructor() {
        super(() => document.querySelector("form.account-form"));
    }

    onSubmit(formData) {
        return accountsController.save(
            new Account(
                new AccountHolder(
                    formData.get("first-name"),
                    formData.get("last-name"),
                    formData.get("date-of-birth")
                )
            )
        )
    }

} */

// TEMPLATE METHOD PATTERN (SYNCHRONOUS) (see forms.js)
// JAVA STYLE (see abstractive.js - Interface v.1.0)

/* export class AccountForm extends FormInterface {

    constructor() {
        super(() => document.querySelector("form.account-form"));
    }

    onSubmit() {
        super.onSubmit();
    }

    constructModel(formData) {
        return  new Account(
            new AccountHolder(
                formData.get("first-name"),
                formData.get("last-name"),
                formData.get("date-of-birth")
            )
        );
    }

    saveModel(model) {
        accountsController.save(model);
    }

} */

// PROMISE-BASED DEPENDENCY INJECTION (see forms.js)
// import { Form } from "/website/modules/forms.js";
/* export class AccountForm extends Form {

    constructor() {

        const constructPromiseHandler = (formData) => 
            new Promise((resolve, reject) => {
                resolve(new Account(
                    new AccountHolder(
                        formData.get("first-name"),
                        formData.get("last-name"),
                        formData.get("date-of-birth")
                    )
                ))
            });

        const savePromiseHandler = (object) => 
            new Promise((resolve, reject) => {
                resolve(accountsController.save(object))
            });

        super(
            () => document.querySelector("form.account-form"),
            constructPromiseHandler,
            savePromiseHandler
        );
    }

} */

// CALLBACK-BASED DEPENDENCY INJECTION (see forms.js)
// import { Form } from "/website/modules/forms.js";
/* export class AccountForm extends Form {

    constructor() {
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

} */