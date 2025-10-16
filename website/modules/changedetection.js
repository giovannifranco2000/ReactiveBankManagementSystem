// for accounts:
// will listen to render events and handle them depending on their arguments
// 1 argument (node) -> add to list or update existing node
// 1 argument (number) -> delete from list
// 1 argument (collection) -> render all


// OLD CODE (for future reference):
/* _container;
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
} */