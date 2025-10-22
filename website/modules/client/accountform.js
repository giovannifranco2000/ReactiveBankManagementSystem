import { FormInterface } from "/modules/js_framework/forms.js";
import { AccountDetailsDto } from "/modules/client/dtos.js";
import { default as accountsController } from "/modules/client/accountsmvc.js";

// TEMPLATE METHOD ANTI-PATTERN (ASYNCHRONOUS) (see forms.js)
// PROTOTYPE REFLECTION (see abstractive.js)

export class AccountForm extends FormInterface {

    constructor() {
        super(() => document.querySelector("form.account-form"));
    }

    async onSubmit(formData) {
        const model = new AccountDetailsDto(
            null,
            formData.get("first-name"),
            formData.get("last-name"),
            formData.get("date-of-birth"),
            formData.get("birthplace"),
            formData.get("gender"),
            formData.get("address"),
            formData.get("document-type"),
            formData.get("document-id"),
            formData.get("cellphone"),
            formData.get("email"),
            formData.get("cf"),
            formData.get("iban"),
            formData.get("branch"),
            formData.get("balance"),
            "active"
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
// import { Form } from "/modules/forms.js";
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
// import { Form } from "/modules/forms.js";
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