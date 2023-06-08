import { request } from "../functions";
// import mixin from "../../mixins/index";
let realProducts;
export default {
  //получение списка товаров
  getProductsAPI({ commit, rootState }) {
    return request("crm.catalog.list", {})
      .then(catalogs => {
        let catalogs_id = catalogs.map(catalog => catalog.ID);
        return catalogs_id;
      })
      .then(catalogs_id => {
        return request("crm.product.list", {
          select: ["ID", "NAME", "PRICE", "CATALOG_ID"],
          filter: {
            CATALOG_ID: catalogs_id,
          }
        });
      })
      .then(products =>{
          realProducts = products;
          return request('entity.item.get',{ENTITY:"balanceStore"});
      })
      .then(balanceProducts => {
        // balanceProducts.find()
        for (let i = 0; i < realProducts.length; i++) {
            var balanceProduct = balanceProducts.find( balance => balance.PROPERTY_VALUES.ID_PRODUCT == realProducts[i].ID)
            if(typeof balanceProduct == "undefined"){
              Object.assign(
                realProducts[i],
                {
                  planed_expense: 0.00.toFixed(2),
                  free_amount: 0.00.toFixed(2),
                  storage_amount: 0.00.toFixed(2),
                }
              );
            }else{
              Object.assign(
                realProducts[i],
                {
                  planed_expense: parseFloat(balanceProduct.PROPERTY_VALUES.PLAN_MINUS).toFixed(2),
                  free_amount: parseFloat((balanceProduct.PROPERTY_VALUES.BALANCE - balanceProduct.PROPERTY_VALUES.PLAN_MINUS)).toFixed(2),
                  storage_amount: parseFloat(balanceProduct.PROPERTY_VALUES.BALANCE).toFixed(2),
                }
              );
            }
        }

        // console.log(balanceProducts)
        // console.log(products)
        // console.log(realProducts)
        //   const element = products[i];
        //   let testObj = request('entity.item.get',{ENTITY:"balanceStore",'FILTER':{ID_PRODUCT:element.ID}}).then(res =>{
        //     if(res.length == 0 ){
        //       return {
        //           planed_expense: 0.00.toFixed(2),
        //           free_amount: 0.00.toFixed(2),
        //           storage_amount: 0.00.toFixed(2),
        //       }
        //     }
        //     else{
        //       return {
        //         planed_expense: 1,
        //         free_amount: 2,
        //         storage_amount: 3,
        //       }
      
        //     }
        //   });
        //   console.log(testObj);
        //   products[i] = Object.assign(products[i], testObj)

        // }
        commit("addProducts", realProducts);
      });
  }
};
