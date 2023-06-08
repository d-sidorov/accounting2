import { request, batchRequest } from "../functions";

export default {
  //получение операций
  getOperationsAPI({ commit }) {
    return request("entity.item.get", {
      ENTITY: "operationsB24app"
    }).then(operations => {
      commit("addOperations", operations);
    });
  },

  //добавление операции
  addOperationAPI({ commit }, operation) {
    // operation.PRODUCT_ID; // ID товара
    // operation.TYPE // EXPENSE - Расход  INCOME - поступлениеъ
    // operation.AMOUNT // EXPENSE - Расход  INCOME - поступлениеъ
    request('entity.item.get',{
      ENTITY:"balanceStore",
      FILTER:{
        PROPERTY_ID_PRODUCT:operation.PRODUCT_ID
      }
    }).then(balanceProduct =>{
      let balance ;
      
      if(balanceProduct.length == 0) {
        if(operation.TYPE == "EXPENSE"){
          balance = 0 - operation.AMOUNT
        }
        else{
          balance = 0 + operation.AMOUNT

        }
        return request('entity.item.add',{
          ENTITY:"balanceStore",
          NAME: "123",
          PROPERTY_VALUES:{
            ID_PRODUCT:operation.PRODUCT_ID,
            BALANCE : balance,
            PLAN_MINUS : 0
          }
        })
      }
      else{
        balanceProduct = balanceProduct[0];
        if(operation.TYPE == "EXPENSE"){
          balanceProduct.PROPERTY_VALUES.BALANCE = parseFloat(balanceProduct.PROPERTY_VALUES.BALANCE) - parseFloat(operation.AMOUNT)
        }
        else{
          balanceProduct.PROPERTY_VALUES.BALANCE = parseFloat(balanceProduct.PROPERTY_VALUES.BALANCE) + parseFloat(operation.AMOUNT)
        }
        return request('entity.item.update',{
          ENTITY:"balanceStore",
          ID: balanceProduct.ID,
          PROPERTY_VALUES:{
            BALANCE :  balanceProduct.PROPERTY_VALUES.BALANCE,
          }
        })
      }
    })
    .then(()=>{
      return request("entity.item.add", {
        ENTITY: "operationsB24app",
        NAME: "item",
        PROPERTY_VALUES: operation
      })
    })
   .then(id => {
      commit("addOperation", { id, operation });
    });
  },

  //добавление массива операций
  addOperationsAPI({ commit }, operations) {
    return new Promise(resolve => {
      let requests = []; //массив для промисов
      while (true) {
        let arrOperations = operations.splice(0, 50); //срез 50 элементов
        let obj = {};
        arrOperations.forEach((params, i) => {
          //добавляем 50 элементов в batch запрос
          obj[i] = [
            "entity.item.add",
            {
              ENTITY: "operationsB24app",
              NAME: "item",
              PROPERTY_VALUES: params
            }
          ];
        });
        requests.push(new Promise(resolve => resolve(batchRequest(obj)))); //добавляем в массив промисов batch запрос
        if (arrOperations.length < 50) break;
      }
      Promise.all(requests).then(res => {
        return resolve(res);
      }); //вызываем все запросы
    });
  },

  //удаление операции
  deleteOperationAPI({ commit }, operation_id) {
    if (operation_id[0] == 0) {
      commit("deleteOperation", operation_id);
      return Promise.resolve();
    } else
      return request("entity.item.delete", {
        ENTITY: "operationsB24app",
        ID: operation_id
      }).then(() => {
        commit("deleteOperation", operation_id);
        return Promise.resolve();
      });
  },

  //обновление операции
  updateOperationAPI({commit}, fields) {
    return request('entity.item.update', {
      ENTITY: 'operationsB24app',
      ID: fields.id,
      PROPERTY_VALUES: fields.fields,
    }).then(() => {
      commit('updateOperation', fields);
    })
  }
};