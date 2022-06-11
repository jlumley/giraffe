const PREFIX = "/payee";

const payeeRequests = {
    fetchAllPayees: `${PREFIX}`,
    createPayee: `${PREFIX}/create`,
    updatePayee: `${PREFIX}/update/`,
};

export default payeeRequests;
