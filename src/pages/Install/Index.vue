<template>
  <div class="row">
    <div class="col-9">
      <div class="q-pa-md q-gutter-y-sm">
        <div class="row">
          <h4 class="q-my-sm">Настройка приложения «Учет товара на складе»</h4>
        </div>
        <div class="row">
          <div class="col-12">
            <p>
              1) Этапы добавления товара в планируемый расход
            </p>
          </div>
          <div class="col-12 q-gutter-y-sm">
            <template v-for="(stage, i) in stages">
              <select-stage
                :stageProp="stage.start"
                :key="i"
                :isDelStage="stages.length > 1"
                @delStage="delStage(stage)"
                :categories="selectCategories(i)"
                :stages="selectStages(stage.start.category.ID)"
              ></select-stage>
            </template>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <p>
              2) Этапы списания товара со склада
            </p>
          </div>
          <div class="col-12 q-gutter-y-sm">
            <template v-for="(stage, i) in stages">
              <select-stage
                :stageProp="stage.end"
                :key="i"
                :isDelStage="stages.length > 1"
                @delStage="delStage(stage)"
                :categories="selectCategories(i)"
                :stages="selectStages(stage.end.category.ID)"
              ></select-stage>
            </template>
          </div>
        </div>
        <div class="row">
          <q-btn
            v-if="getCategories.length > stages.length"
            color="primary"
            label="Добавить еще"
            @click="addStage"
          />
        </div>
        <div class="row">
          <div class="col-12">
            <p>
              3) Права пользователей для настройки приложения
            </p>
          </div>
          <div class="col-12">
            <q-select
              filled
              dense
              label="Выберите пользователей"
              v-model="usersSettingsRights"
              use-input
              use-chips
              multiple
              :options="getUserOptions"
              option-value="ID"
              option-label="NAME"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <p>
              4) Права пользователей для добавления операций
            </p>
          </div>
          <div class="col-12">
            <q-select
              filled
              dense
              label="Выберите пользователей"
              v-model="usersAddRights"
              use-input
              use-chips
              multiple
              :options="getUserOptions"
              option-value="ID"
              option-label="NAME"
              emit-value
              map-options
            />
          </div>
        </div>
        <!-- <div class="row">
          <q-checkbox
            v-model="getCurrentDeals"
            label="5) Нажмите галочку, если хотите при установке приложения учитывать товары в текущих сделках"
          />
        </div> -->
        <div class="row">
          <q-checkbox
            v-model="infoToComments"
            label="5) Выводить подробную информацию о заказе в поле 'Комментарий'"
          />
        </div>
        <div class="row q-gutter-x-sm">
          <q-btn
            color="primary"
            icon-right="done"
            label="Установить"
            @click="saveSettings"
          />
          <!-- <q-btn
            color="primary"
            icon-right="done"
            label="Удалить"
            @click="del"
          /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import selectStage from "../../components/SelectStage";
import { batchRequest } from "../../store/modules/functions";
import mixin from "../../mixins/index";

export default {
  mixins: [mixin],
  data() {
    return {
      stages: [
        {
          start: {
            category: { ID: null, NAME: null },
            stage: { ID: null, NAME: null }
          },
          end: {
            category: { ID: null, NAME: null },
            stage: { ID: null, NAME: null }
          }
        }
      ],
      usersSettingsRights: [],
      usersAddRights: [],
      getCurrentDeals: false,
      infoToComments: false
    };
  },
  created() {
    this.del();
    this.getDealsCategoriesAPI()
      .then(() => {
        return this.getDealsStagesAPI();
      })
      .then(() => {
        this.getUsersAPI();
      });
  },
  computed: {
    ...mapGetters("settings", ["getUsers", "getCategories", "getStages"]),
    ...mapGetters("deals", ["getDeals", "getProductrows"]),

    getUserOptions() {
      return this.getUsers.map(user => {
        return {
          NAME: `${user.LAST_NAME} ${user.NAME}`,
          ID: user.ID
        };
      });
    }
  },
  methods: {
    ...mapActions("settings", [
      "getDealsCategoriesAPI",
      "getDealsStagesAPI",
      "getUsersAPI",
      "saveSettingsAPI",
      "addPlacementAPI",
      "getEntityAPI",
      "addEntityAPI",
      "addEntityBalance",
      "getUserFieldAPI",
      "addEventBind",
      "addUserFieldAPI",
      "addSettingsAPI",
      "getPlacementAPI",
      "deletePlacementAPI"
    ]),
    ...mapActions("deals", ["getDealsAPI", "getProductrowsAPI"]),

    selectStages(category_id) {
      return this.getStages[category_id] || [];
    },

    selectCategories(index) {
      return this.getCategories.filter(category => {
        let stageIndex = this.stages.findIndex(stage => {
          return (
            stage.start.category.ID == category.ID ||
            stage.end.category.ID == category.ID
          );
        });
        if (stageIndex > -1 && index != stageIndex) return false;
        return true;
      });
    },

    addStage() {
      this.stages.push({
        start: {
          category: { ID: null, NAME: null },
          stage: { ID: null, NAME: null }
        },
        end: {
          category: { ID: null, NAME: null },
          stage: { ID: null, NAME: null }
        }
      });
    },
    delStage(stage) {
      let index = this.stages.indexOf(stage);
      this.stages.splice(index, 1);
    },
    saveSettings() {
      BX24.init(() => {
        this.showNotification("grey-8", "Встраивание приложения");
        //получение встроенного в карточку сделки приложения
        this.getPlacementAPI()
          .then(placements => {
            if (
              placements.find(
                placement =>
                  placement.handler == this.$store.state.settings.handler
              )
            )
              //если установлено, пропускаем, иначе устанавливаем
              return Promise.resolve();
            return this.addPlacementAPI();
          })
          .then(() => {
            this.showNotification("grey-8", "Добавление поля");
            return this.addUserField();
          })
          .then(res => {
            //проверка на существование хранилища
            return this.getEntityAPI();
          })
          .then(isEntity => {
            //если хранилище создано - пропускаем, иначе создаем
            if (isEntity) return Promise.resolve();
            else {
              this.showNotification("grey-8", "Создание хранилища для операций");
              return this.addEntityAPI();
            }
          })
          .then(()=>{
             return this.getEntityAPI("balanceStore");
          })
          .then(isEntityBalance =>{
            if(isEntityBalance) return Promise.resolve();
            else{
              this.showNotification("grey-8", "Создание хранилища для остатков");
              return this.addEntityBalance();
            }
          })
          .then(()=>{
            this.showNotification("grey-8", "Добавление обработчика");
            return this.addEventBind();
          })
          // .then(() => {
          // // если добавлять операции по существующим сделкам - добавляем, иначе пропусе
          //   if (this.getCurrentDeals) {
          //     return this.installCurrentDeals();
          //   } else return Promise.resolve();
          // })
          .then(() => {
            //добавление настроек приложения
            this.showNotification("grey-8", "УСтановка настроек");
            let options = {
              stages: this.stages,
              usersSettingsRights: this.usersSettingsRights,
              usersAddRights: this.usersAddRights,
              infoToComments: this.infoToComments,
              exceptionList: [],
              version: "1.0"
            };
            return this.addSettingsAPI({ options });
          })
          .then(() => {
            BX24.installFinish();
          });
      });
    },
    installCurrentDeals() {
      // let categories = Object.keys(this.stages).map(key => {
      //   return this.stages[key].category.ID;
      // });

      //получение массива категорий, сделки в которых будут собираться
      let categories = [
        ...new Set(
          this.stages.reduce((acc, stage) => {
            return [...acc, +stage.start.category.ID, +stage.end.category.ID];
          }, [])
        )
      ];

      let filter = {
        CATEGORY_ID: categories,
        STAGE_SEMANTIC_ID: ["P", "S"]
      };

      let order = { ID: "DESC" };

      //получаем сделки
      return this.getDealsAPI({ filter, order })
        .then((deals) => {
          //если сделок нет, пропускаем, иначе получаем товарные позиции сделок
          if (deals.length == 0) return Promise.resolve();
          let owners_id = deals.map(deal => deal.ID);
          return this.getProductrowsAPI(owners_id);
        })
        .then(() => {
          //если товарных позиций нет - пропускаем
          if (this.getProductrows.length == 0) return Promise.resolve();

          let fields = [];
          let promiseArr = [];
          this.getProductrows.forEach(productrow => {
            if (productrow.PRODUCT_ID == 0) return;
            let deal = this.getDeals.find(
              deal => deal.ID == productrow.OWNER_ID
            );
            fields.push({
              PRODUCT_ID: productrow.PRODUCT_ID,
              TYPE: "EXPENSE",
              DATE: this.getFormatDate(deal.DATE_CREATE),
              OBJECT: productrow.OWNER_ID,
              OBJECT_TYPE: "DEAL",
              EMPLOYEE: deal.ASSIGNED_BY_ID,
              AMOUNT: +productrow.QUANTITY,
              COMMENT: ""
            });
          });

          let offset = 50;
          let arrRequests = [];

          while (true) {
            let request = {};
            fields.slice(offset - 50, offset).forEach((field, i) => {
              request[i] = [
                "entity.item.add",
                {
                  ENTITY: "operationsB24app",
                  NAME: "item",
                  PROPERTY_VALUES: field
                }
              ];
            });
            arrRequests.push(request);
            if (!fields[offset] || arrRequests.length == 50) break;
            offset += 50;
          }
          arrRequests.forEach(request => {
            promiseArr.push(
              new Promise(resolve => {
                resolve(batchRequest(request));
              })
            );
          });
          return Promise.all(promiseArr);
        });
    },

    del() {
      let requests = {
        opers_delete: ["entity.delete", { ENTITY: "operationsB24app" }],
        placement_delete: [
          "placement.unbind",
          { PLACEMENT: "CRM_DEAL_DETAIL_TAB" }
        ]
        // field_delete: [
        //   'userfieldtype.delete',
        //   {USER_TYPE_ID: 'deal_card_field_app'}
        // ]
      };
      batchRequest(requests);
    },

    addUserField() {
      return this.getUserFieldAPI().then(res => {
        if (res.length == 0) return this.addUserFieldAPI();
        else {
          let isInstall = res.find(field => {
            return field.USER_TYPE_ID == "deal_card_field_app";
          });
          if (!isInstall) return this.addUserFieldAPI();
        }
        return Promise.resolve();
      });
    }
  },
  components: {
    selectStage
  }
};
</script>

<style></style>
