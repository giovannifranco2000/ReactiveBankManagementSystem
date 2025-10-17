export class Form {

    #form;

    constructor(formNodeCallback, constructCallback, saveCallback) {
        this.#form = formNodeCallback() ?? document.querySelector("form");
        this.onSubmit(constructCallback, saveCallback);
    }

    get form() {
        return this.#form;
    }

    onSubmit(constructCallback, saveCallback) {
        this.#form.addEventListener("submit", (event) => {
            event.preventDefault();
            let formData = new FormData(event.target);
            saveCallback(constructCallback(formData));
        })
    }

}