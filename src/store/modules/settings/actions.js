import { request, batchRequest } from "../functions";

const fields = [
  {
    ENTITY: "operationsB24app",
    PROPERTY: "PRODUCT_ID",
    NAME: "ИД товара",
    TYPE: "N"
  },
  {
    ENTITY: "operationsB24app",
    PROPERTY: "TYPE",
    NAME: "Тип события",
    TYPE: "S"
  },
  {
    ENTITY: "operationsB24app",
    PROPERTY: "DATE",
    NAME: "Дата",
    TYPE: "S"
  },
  {
    ENTITY: "operationsB24app",
    PROPERTY: "OBJECT",
    NAME: "Объект операции",
    TYPE: "N"
  },
  {
    ENTITY: "operationsB24app",
    PROPERTY: "OBJECT_TYPE",
    NAME: "Тип объекта",
    TYPE: "S"
  },
  {
    ENTITY: "operationsB24app",
    PROPERTY: "EMPLOYEE",
    NAME: "Сотрудник",
    TYPE: "N"
  },
  {
    ENTITY: "operationsB24app",
    PROPERTY: "AMOUNT",
    NAME: "Количество",
    TYPE: "N"
  },
  {
    ENTITY: "operationsB24app",
    PROPERTY: "COMMENT",
    NAME: "Комментарий",
    TYPE: "S"
  }
];

const fieldsBalanceStore = [
  {
    ENTITY : "balanceStore",
    PROPERTY : "ID_PRODUCT",
    NAME: "ID товара",
    TYPE: "N"
  },
  {
    ENTITY : "balanceStore",
    PROPERTY : "BALANCE",
    NAME: "Остатки на складе",
    TYPE: "N"
  },
  {
    ENTITY : "balanceStore",
    PROPERTY : "PLAN_MINUS",
    NAME: "Планируемый расход ",
    TYPE: "N"
  },
]
export default {
  //получние настроек приложения
  getSettingsAPI({ commit }) {
    return batchRequest({
      options: ["app.option.get", {}],
      // users: ["user.get", {}],
      currentUser: ["user.current", {}],
      measures: ["crm.measure.list", {}]
    }).then(res => {
      // commit("addUsers", res.users.data());
      commit("addSettings", res.options.data());
      commit("addCurrentUser", res.currentUser.data());
      commit("addMeasures", res.measures.data());
      request('user.get',{}).then(users=>{
        commit("addUsers", users);

      })
    });
  },

  //обновление настроек
  addSettingsAPI({ commit }, { options }) {
    return request("app.option.set", { options });
  },

  //получение направлений сделок
  getDealsCategoriesAPI({ commit }) {
    return batchRequest({
      defaultCategory: ["crm.dealcategory.default.get", {}],
      categories: {
        method: "crm.dealcategory.list",
        params: {
          select: ["ID", "NAME"]
        }
      }
    }).then(res => {
      commit("addCategories", [
        res.defaultCategory.data(),
        ...res.categories.data()
      ]);
    });
  },

  //получение стадий сделок
  getDealsStagesAPI({ commit, state }) {
    let fields = {};
    state.categories.forEach(category => {
      fields[category.ID] = [
        "crm.dealcategory.stage.list",
        { id: category.ID }
      ];
    });
    return batchRequest(fields).then(res => {
      Object.keys(res).forEach(category_id => {
        let stages = res[category_id].data();
        commit("addStages", { category_id, stages });
      });
    });
  },

  //получение пользователей
  getUsersAPI({ commit }) {
    return request("user.get", {}).then(users => {
      commit("addUsers", users);
    });
  },

  //получение хранилища операций
  getEntityAPI(entityName = "operationsB24app") {
    return request("entity.get", {}).then(entities => {
      return entities.find(entity => entity.ENTITY == entityName);
    });
  },

  //добавление операции в хранилище
  addEntityAPI() {
    return request("entity.add", {
      ENTITY: "operationsB24app",
      NAME: "Учет товаров",
      ACCESS: {
        U1: "X",
        AU: "X"
      }
    }).then(() => {
      let request = {};
      fields.forEach((field, i) => {
        request[i] = ["entity.item.property.add", field];
      });
      return batchRequest(request);
    });
  },
  //добавление остатков в хранилище
  addEntityBalance() {
    return request("entity.add", {
      ENTITY: "balanceStore",
      NAME: "Остатки",
      ACCESS: {
        U1: "X",
        AU: "X"
      }
    }).then(() => {
      let request = {};
      fieldsBalanceStore.forEach((field, i) => {
        request[i] = ["entity.item.property.add", field];
      });
      return batchRequest(request);
    });
  },
  // Добавление обработчиков события
  addEventBind(){
    // onCrmDealAdd
    // onCrmDealUpdate
    return request('event.bind',{'event':"onCrmDealUpdate","handler":"https://uchet.tovarov.simbirbit.ru/uchet_ajax/ajax_dev.php"}).then(()=>{
      return request('event.bind',{'event':"onCrmDealAdd","handler":"https://uchet.tovarov.simbirbit.ru/uchet_ajax/ajax_dev.php"}).then(()=>{
        return request('event.bind',{'event':"onCrmDealDelete","handler":"https://uchet.tovarov.simbirbit.ru/uchet_ajax/ajax_dev.php"}).then(()=>{
        
        })
      })
    })
  },
  //получение пользовательских полей
  getUserFieldAPI() {
    return request("userfieldtype.list", {});
  },


  //добавление пользовательского поля в карточку сделок
  addUserFieldAPI({state}) {
    return request("userfieldtype.add", {
        USER_TYPE_ID: "deal_card_field",
        HANDLER: state.fieldHandler,
        TITLE: "Комплектность заказа",
        DESCRIPTION:
          'Вывод информации из вкладки "Товары" в пользовательское поле сделки'
      });
  },

  //добавление вкладки приложения в карточку сделки
  addPlacementAPI({ state }) {
    return request("placement.bind", {
      PLACEMENT: "CRM_DEAL_DETAIL_TAB",
      HANDLER: state.handler,
      TITLE: "Корзина",
      DESCRIPTION: "Корзина"
    });
  },


  //удаление вкладки приложения
  deletePlacementAPI({ state }) {
    return request("placement.unbind", {});
  },

  //получение вкладки приложения
  getPlacementAPI() {
    return request("placement.get");
  }
};
