export default {
    getOperations(state) {
        return state.operations
    },
    getOperationsByProductId(state) {
        return (product_id) => {
            return state.operations.filter(operation => operation.PROPERTY_VALUES.PRODUCT_ID == product_id).sort((a,b) => {
                return +new Date(b.DATE_CREATE) - +new Date(a.DATE_CREATE);
            })
        }
    },
}