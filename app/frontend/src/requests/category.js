const PREFIX = "/category";

const categoryRequests = {
    fetchAllCategoryGroups: `${PREFIX}/groups`,
    fetchAllCategoryNames: `${PREFIX}/names`,
    fetchAllCategories: `${PREFIX}`,
    fetchCategory: `${PREFIX}`,
    createNewCategory: `${PREFIX}/create`,
    updateCategory: `${PREFIX}/update/`,
    updateCategoryTarget: `${PREFIX}/target/`,
    DeleteCategoryTarget: `${PREFIX}/target/`,
    assignCategory: `${PREFIX}/assign/`,
    unassignCategory: `${PREFIX}/unassign/`,
    fetchTargetTypes: `${PREFIX}/target/types`,
};

export default categoryRequests;
