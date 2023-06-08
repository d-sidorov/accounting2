<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <template v-if="!isLoad && !alert">
        <router-view />
      </template>
      <template v-if="alert">
        <div class="q-pa-sm">
          <div class="text-h6">Внимание!</div>
          <br />
          Вышла новая версия приложения, переустановите пожалуйста приложение.
          Все актуальные остатки товаров при перестановке сохранятся!<br /><br />
          Инструкция по переустановке:<br />
          1. Зайдите в раздел "Приложения" раздел "Установленные";<br />
          2. Удалите приложение "Учёт товаров на складе", не удаляйте старые настройки<br />
          3. Обновите страницу;<br />
          4. Перейдите по ссылке
          <a
            href="https://www.bitrix24.ru/apps/?app=bitrix-PK.uchyet_tovarov"
            target="_blank"
            >https://www.bitrix24.ru/apps/?app=bitrix-PK.uchyet_tovarov</a
          >, нажмите попробовать, установите приложение на портал Или напишите в
          техподдержку WhatsApp <a href="tel:89372735761">89372735761</a> мы
          сделаем все за вас;<br /><br />

          К сожалению Битрикс24 не позволяет совершать автоматические обновления
          программ. Для более понятного алгоритма переезда прикладываю
          видеоинструкцию.<br />
          (для открытия в полном экране нажмите на видео ПКМ и выберите "открыть
          видео в новой вкладке")<br />
          <video width="700" height="500" controls="controls">
            <source
              src="https://uchet.tovarov.simbirbit.ru/uchet/assets/instruction.mp4"
              type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            />
            Тег video не поддерживается вашим браузером.
          </video>
        </div>
      </template>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import mixin from "../mixins/index";

export default {
  name: "MainLayout",
  mixins: [mixin],
  data() {
    return {
      isLoad: true,
      alert: false
    };
  },
  computed: {
    ...mapGetters("settings", [
      "getStatuses",
      "getStages",
      "getSettings",
      "getCurrentUser"
    ]),
    ...mapGetters("operations", ["getOperations"]),
    ...mapGetters("deals", ["getDeals", "getProductrows"]),
    ...mapGetters("products", ["getProducts"]),

    getDealsIdList() {
      return this.getOperations.map(operation => {
        if (operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL")
          return operation.PROPERTY_VALUES.OBJECT;
      });
    }
  },
  methods: {
    ...mapActions("products", ["getProductsAPI"]),
    ...mapActions("operations", [
      "getOperationsAPI",
      "addOperationAPI",
      "addOperationsAPI"
    ]),
    ...mapActions("settings", [
      "getSettingsAPI",
      "getDealsCategoriesAPI",
      "getDealsStagesAPI"
    ]),
    ...mapActions("deals", ["getDealsAPI", "getProductrowsAPI"]),

    ...mapMutations("operations", ["addOperation"]),

    showLoading() {
      this.isLoad = true;
      this.$q.loading.show();
    },

    hideLoading() {
      this.isLoad = false;
      this.$q.loading.hide();
    },

    init() {
      //показать прелоадер
      this.showLoading();
      //получаем список направлений сделок
      this.showNotification("grey-8", "Получение воронок", 1000);
      this.getSettingsAPI()
        .then(() => {
          if (!this.getSettings.version || this.getSettings.version != "1.0") {
            this.alert = true;
            this.hideLoading();
            throw new Error();
          }
          return this.getDealsCategoriesAPI();
        })
        .then(() => {
          return this.getDealsStagesAPI(); //получаем список стадий сделок
        })
        .then(() => {
          this.showNotification("grey-8", "Получение списка товаров", 1000);
          return this.getProductsAPI(); //получаем список товаров
        })
        // .then(() => {
        //   this.showNotification("grey-8", "Получение списка операций", 1000);
        //   return this.getOperationsAPI(); //получаем список операций
        // })
        // .then(() => {
        //   this.showNotification("grey-8", "Получение сделок", 1000);
        //   //получаем список сделок по операциям
        //   let dealsId = this.getDealsIdList;
        //   let filter = {
        //     ID: dealsId
        //   };
        //   let order = { ID: "DESC" };
        //   return this.getDealsAPI({ filter, order });
        //   // return Promise.resolve();
        // })
        // .then(() => {
        //   //получаем список сделок по всем стадиям из настроек
        //   let filter = {
        //     STAGE_ID: [
        //       ...this.getDiapasonOfStages.planed,
        //       ...this.getDiapasonOfStages.expense
        //     ],
        //     "!ID": this.getDealsIdList
        //   };
        //   return this.getDealsAPI({ filter });
        // })
        // .then(() => {
        //   this.showNotification("grey-8", "Получение товарных позиций", 1000);
        //   //получаем товарные позиции по всем сделкам
        //   return this.getProductrowsAPI(this.getDeals.map(deal => deal.ID));
        // })
        // .then(() => {
        //   //слияние операций в хранилище и товарных позиций в сделках
        //   this.getProductrows.forEach(productrow => {
        //     let deal = this.getDeals.find(
        //       deal => deal.ID == productrow.OWNER_ID
        //     );
        //     let id = `0${productrow.ID}`;
        //     let operation = {
        //       PRODUCT_ID: productrow.PRODUCT_ID,
        //       TYPE: "EXPENSE",
        //       DATE: this.getFormatDate(deal.DATE_CREATE),
        //       OBJECT: productrow.OWNER_ID,
        //       OBJECT_TYPE: "DEAL",
        //       EMPLOYEE: deal.ASSIGNED_BY_ID,
        //       AMOUNT: +productrow.QUANTITY,
        //       COMMENT: ""
        //     };
        //     this.addOperation({ id, operation });
        //   });
        //   return Promise.resolve();
        // })
        .then(res => {
          this.hideLoading();
        });
    },
  },
  created() {
    BX24.init(() => {
      this.init();
    });
  }
};
</script>
