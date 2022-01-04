const PREFIX = "/transaction";

const transactionRequests = {
    fetchTransactions: `${PREFIX}`,
    createNewTransaction: `${PREFIX}/create`
}

export default transactionRequests;
