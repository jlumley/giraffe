const PREFIX = "/account";

const accountRequests = {
    fetchAllAccounts: `${PREFIX}`,
    fetchAccount: `${PREFIX}/`,
    createNewAccount: `${PREFIX}/create`,
    hideAccount: `${PREFIX}/hide/`,
    unhideAccount: `${PREFIX}/unhide/`,
    reconcileAccount: `${PREFIX}/reconcile/`
}

export default accountRequests;
