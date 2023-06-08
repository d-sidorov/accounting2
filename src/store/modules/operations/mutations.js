export default {
    addOperations(state, operations) {
      state.operations = operations;
    },
    // editBalance
    addOperation(state, {id, operation}) {
      state.operations.push({
        ID: id,
        PROPERTY_VALUES: operation
      });
    },
    deleteOperation(state, operation_id) {
      let index = state.operations.findIndex(operation => operation.ID == operation_id);
      state.operations.splice(index, 1);
    },
    updateOperation(state, fields) {
      let operation = state.operations.find(oper => oper.ID == fields.id);
      if (operation) {
        for (let key in fields.fields) {
          operation.PROPERTY_VALUES[key] = fields.fields[key];
        }
      }
    }
  }