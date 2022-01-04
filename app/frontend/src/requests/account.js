const PREFIX = "/account";

const requests = {
    fetchAllAccounts: `${PREFIX}`,
    createNewAccount: `${PREFIX}/create`,
    hideAccount: `${PREFIX}/hide/`,
    unhideAccount: `${PREFIX}/unhide/`,
    reconcileAccount: `${PREFIX}/reconcile/`
}
