const PREFIX = "/transaction";

const transactionRequests = {
    fetchTransaction: `${PREFIX}/`,
    fetchTransactions: `${PREFIX}`,
    updateTransaction: `${PREFIX}/update/`,
    createNewTransaction: `${PREFIX}/create`,
    createNewTransfer: `${PREFIX}/transfer/create`,
    deleteTransaction: `${PREFIX}/delete/`
}

export default transactionRequests;
