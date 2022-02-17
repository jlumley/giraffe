const PREFIX = "/category";

const categoryRequests = {
    fetchAllCategoryGroups: `${PREFIX}/groups`,
    fetchAllCategoryNames: `${PREFIX}/names`,
    fetchAllCategories: `${PREFIX}`,
    fetchCategory: `${PREFIX}`,
    createNewCategory: `${PREFIX}/create`,
    updateCategory: `${PREFIX}/update/`,
    updateCategoryTarget: `${PREFIX}/update/`,
    DeleteCategoryTarget: `${PREFIX}/delete/`,
    assignCategory: `${PREFIX}/assign/`,
    unassignCategory: `${PREFIX}/unassign/`,
};

export default categoryRequests;
