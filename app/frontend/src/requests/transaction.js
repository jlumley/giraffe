const PREFIX = "/transaction";

const transactionRequests = {
    fetchTransactions: `${PREFIX}`,
    updateTransaction: `${PREFIX}/update/`,
    createNewTransaction: `${PREFIX}/create`
}

export default transactionRequests;
