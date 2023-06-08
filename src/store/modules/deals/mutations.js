export default {
  addDeals(state, deals) {
    state.deals.push(...deals);
  },
  addProductrows(state, productrows) {
    state.productrows = productrows;
  },
  addProductRow(state, productrow) {
    state.productrows.push(productrow);
  },
  deleteProductrow(state, index) {
    state.productrows.splice(index, 1);
  }
}