import { mapGetters } from "vuex";
import { request } from "../store/modules/functions";

export default {
  data() {
    return {};
  },
  computed: {
    ...mapGetters("settings", ["getSettings", "getStages"]),
    ...mapGetters("operations", ["getOperations"]),
    ...mapGetters("deals", ["getDeals"]),

    getPlacement() {
      return BX24.placement.info();
    },

    isAdmin() {
      return BX24.isAdmin();
    },

    //получаем диапазон стадий сделок, в которой товар считается в планируемом расходе
    getDiapasonOfStages() {
      let res = {
        planed: [],
        expense: []
      };
      this.getSettings.stages.forEach(stage => {
        let startStage = stage.start; //начало диапазона
        let endStage = stage.end; //конец диапазон

        //если сделки проходят в одной воронке
        if (startStage.category.ID == endStage.category.ID) {
          let category = this.getStages[startStage.category.ID];
          if (category) {
            res.planed.push(
              ...category
                .filter(
                  stage =>
                    stage.SORT >= startStage.stage.SORT &&
                    stage.SORT < endStage.stage.SORT
                )
                .map(stage => stage.STATUS_ID)
            );
            res.expense.push(
              ...category
                .filter(stage => stage.SORT >= endStage.stage.SORT)
                .map(stage => stage.STATUS_ID)
            );
          }
          //если начало и конец диапазона в разных воронках
        } else if (startStage.category.ID != endStage.category.ID) {
          if (
            this.getStages[startStage.category.ID] &&
            this.getStages[endStage.category.ID]
          ) {
            let startIndex = this.getStages[startStage.category.ID].findIndex(
              stage => stage.STATUS_ID == startStage.stage.STATUS_ID
            );
            let endIndex = this.getStages[endStage.category.ID].findIndex(
              stage => stage.STATUS_ID == endStage.stage.STATUS_ID
            );
            res.planed.push(
              ...[
                ...this.getStages[startStage.category.ID].slice(startIndex),
                ...this.getStages[endStage.category.ID].slice(0, endIndex)
              ].map(stage => stage.STATUS_ID)
            );
            res.expense.push(
              ...this.getStages[endStage.category.ID]
                .slice(endIndex)
                .map(stage => stage.STATUS_ID)
            );
          }
        }
      });
      return res;
    },

    getDealsInDiapason() {
      return this.getDeals.filter(deal => {
        return (
          this.getDiapasonOfStages.planed.includes(deal.STAGE_ID) ||
          this.getDiapasonOfStages.expense.includes(deal.STAGE_ID)
        );
      });
    }
  },
  methods: {
    //сортировка
    sort(rows, sortBy, descending) {
      const data = [...rows];
      if (sortBy) {
        data.sort((a, b) => {
          const x = descending ? b : a;
          const y = descending ? a : b;

          if (sortBy === "name") {
            return x[sortBy].toLowerCase() > y[sortBy].toLowerCase()
              ? 1
              : x[sortBy].toLowerCase() < y[sortBy].toLowerCase()
              ? -1
              : 0;
          } else {
            return x[sortBy] - y[sortBy];
          }
        });
      }
      return data;
    },

    //подсчет итоговой суммы со скидкой
    getTotalWithDiscount(price, amount, discount) {
      let sum = 0;
      let res = 0;
      sum = price * amount;

      if (this.discountTypeId == 2) {
        res = sum - (sum / 100) * discount;
      } else if (this.discountTypeId == 1) {
        if (this.discountType == "общ") res = sum - discount;
        else if (this.discountType == "ед") res = sum - amount * discount;
      }
      return +res.toFixed(2);
    },

    //удаление товарной позиции по id
    deleteRow(productrow_id, owner_id) {
      if (
        !this.getSettings.usersAddRights.includes(this.getCurrentUser.ID) &&
        !this.isAdmin
      ) {
        this.showNotification("negative", "Недостаточно прав");
        return Promise.reject();
      }
      let index = this.getProductrows.findIndex(
        productrow => productrow.ID == productrow_id
      );
      if (index > -1) {
        this.deleteProductrow(index);
        this.updateProductrowsAPI(owner_id).then(() => {
          this.showNotification("positive", "Операция успешно удалена");
        }).then(() => {
          return Promise.resolve();
        });
      }
    },

    //получение отформатированной даты
    getFormatDate(date) {
      let _date = new Date(date);
      let Y = _date.getFullYear();
      let M = `0${_date.getMonth() + 1}`.slice(-2);
      let D = `0${_date.getDate()}`.slice(-2);
      return `${Y}-${M}-${D}`;
    },

    //подсчет суммы пришедшего товара по его id
    getIncomeProduct(product_id) {
      return this.getOperations
        .filter(operation => {
          return (
            operation.PROPERTY_VALUES.TYPE == "INCOME" &&
            operation.PROPERTY_VALUES.PRODUCT_ID == product_id
          );
        })
        .reduce((acc, cur) => acc + Number(cur.PROPERTY_VALUES.AMOUNT), 0);
    },
    // получить остаток по товару
    getBalanceProduct(product_id){
      // return new Promise
      return  request('entity.item.get',{ENTITY:"balanceStore",'FILTER':{ID_PRODUCT:product_id}}).then(res =>{
        if(res.length == 0 ){
          return {
              planed_expense: 0.00.toFixed(2),
              free_amount: 0.00.toFixed(2),
              storage_amount: 0.00.toFixed(2),
          }
        }
        else{
          return {
            planed_expense: 1,
            free_amount: 2,
            storage_amount: 3,
          }
  
        }
      })
      // console.log(res)
   
    },
    //подсчет планируемого расхода товара по его id
    getPlanedExpense(product_id) {
      //ищем операции с расходом в сделках по данному продукту, и стадия сделки входит в нужный диапазон
      let operations = this.getOperations.filter(operation => {
        let deal = this.getDeals.find(
          deal =>
            operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL" &&
            deal.ID == operation.PROPERTY_VALUES.OBJECT
        );
        if (!deal) return false;
        return (
          operation.PROPERTY_VALUES.TYPE == "EXPENSE" &&
          operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL" &&
          operation.PROPERTY_VALUES.PRODUCT_ID == product_id &&
          this.getDiapasonOfStages.planed.includes(deal.STAGE_ID) &&
          deal.STAGE_SEMANTIC_ID != "F"
        );
      });
      return operations.reduce(
        (acc, op) => acc + Number(op.PROPERTY_VALUES.AMOUNT),
        0
      );
    },

    //подсчет количества товара на складе по его id
    getSkladAmount(product_id) {
      return (
        this.getIncomeProduct(product_id) -
        this.getDealExpense(product_id) -
        this.getAppExpense(product_id)
      );
    },

    //подсчет свободного остатка товара по его id
    getFreeAmount(product_id) {
      return (
        this.getIncomeProduct(product_id) -
        this.getAppExpense(product_id) - 
        this.getPlanedExpense(product_id)-
        this.getDealExpense(product_id)
      );
    },

    //полуучение расхода в приложении через форму списания
    getAppExpense(product_id) {
      if (product_id == 0) return 0;
      return this.getOperations
        .filter(operation => {
          return (
            operation.PROPERTY_VALUES.PRODUCT_ID == product_id &&
            operation.PROPERTY_VALUES.OBJECT_TYPE == "NUMBER" &&
            operation.PROPERTY_VALUES.TYPE == "EXPENSE"
          );
        })
        .reduce((acc, op) => {
          return +acc + Number(op.PROPERTY_VALUES.AMOUNT);
        }, 0);
    },

    //получение общего расхода товара по его id
    getDealExpense(product_id) {
      if (product_id == 0) return 0;
      let operations = this.getOperations.filter(operation => {
        if (operation.PROPERTY_VALUES.PRODUCT_ID != product_id) return false;

        if (operation.PROPERTY_VALUES.OBJECT_TYPE == "NUMBER") return false;
        else if (operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL") {
          let deal = this.getDeals.find(
            deal =>
              operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL" &&
              deal.ID == operation.PROPERTY_VALUES.OBJECT
          );
          if (!deal) return false;
          if (
            this.getDiapasonOfStages.expense.includes(deal.STAGE_ID) &&
            deal.STAGE_SEMANTIC_ID != "F"
          )
            return true;
          return false;
        }
      });
      return operations.reduce((acc, op) => {
        if (op.PROPERTY_VALUES.TYPE == "EXPENSE")
          return acc + Number(op.PROPERTY_VALUES.AMOUNT);
        else if (op.PROPERTY_VALUES.TYPE == "INCOME")
          return acc - Number(op.PROPERTY_VALUES.AMOUNT);
      }, 0);
    },

    //получение цены товара с учетом скидки
    getPriceWithDiscount(discount, price, amount) {
      if (this.discountTypeId == 2) {
        return price - (price / 100) * discount;
      } else if (this.discountTypeId == 1) {
        if (this.discountType == "общ") {
          return price - discount / amount;
        } else if (this.discountType == "ед") {
          return price - discount;
        }
      }
    },

    //подсчет суммы скидки
    getDiscountPrice(discount, price, amount) {
      if (this.discountTypeId == 2) {
        return discount;
      } else if (this.discountTypeId == 1) {
        if (this.discountType == "общ") {
          return discount / ((price * amount) / 100);
        } else if (this.discountType == "ед") {
          return (amount * discount) / ((price * amount) / 100);
        }
      }
    },

    //метод фильтрации
    inputFilter(val, update) {
      if (val === "" || !val) {
        update(() => {
          if (this.defaultOptions == 'getProducts') return this.getProducts.filter(p => !this.getSettings.exceptionList.includes(p.ID))
          return this[this.defaultOptions];
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.options = this[this.defaultOptions].filter(v =>
          v.NAME.toLowerCase().includes(val) && (this.defaultOptions == 'getProducts' ? !this.getSettings.exceptionList.includes(v.ID) : true)
        );
      });
    },

    //получение ссылки на товар
    getProductLink(id) {
      if (id > 10000000) return false;
      let product = this.getProducts.find(product => product.ID == id);
      return `<a href="https://${BX24.getDomain()}/shop/catalog/${
        product.CATALOG_ID
      }/product/${product.ID}/" target="_blank">${product.NAME}</a>`;
    },

    //показ уведомлений
    showNotification(type, message, timeout = 2500) {
      this.$q.notify({
        type,
        message,
        timeout
      });
    }
  }
};
