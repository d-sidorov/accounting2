<template>
  <q-dialog v-model="showModal" @hide="$emit('closeModal')">
    <q-card>
      <q-card-section class="q-pt-none">
        <q-toolbar>
          <p class="q-ma-none text-h6">Настройки приложения</p>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            v-close-popup
            @click="$emit('closeModal')"
          />
        </q-toolbar>
        <hr />

        <q-toolbar>
          <div class="row items-center a-pa-sm">
            <div class="col-4">SimbIrbit</div>
            <div class="col-4">
              <div class="row">
                <div class="col-12">
                  <a href="tel:+79372735761">+7(937) 273 57 61</a>
                </div>
                <div class="col-12">WhatsApp/Телефон</div>
              </div>
            </div>
            <div class="col-4">
              <a href="mailto:simbirbit@gmail.com">simbirbit@gmail.com</a>
            </div>
          </div>
        </q-toolbar>

        <hr />

        <div class="row">
          <div class="col-12">
            <p class="q-mb-xs">
              1) Этап добавления товара в планируемый расход
            </p>
          </div>
          <div class="col-12 q-gutter-x-sm q-gutter-y-sm">
            <template v-for="(stage, i) in getSettings.stages">
              <select-stage
                :stageProp="stage.start"
                :key="i"
                :isDelStage="getSettings.stages.length > 1"
                @delStage="delStage(stage)"
                :categories="selectCategories(i)"
                :stages="selectStages(stage.start.category.ID)"
              ></select-stage>
            </template>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <p class="q-mb-xs">
              2) Этап списания товара со склада
            </p>
          </div>
          <div class="col-12 q-gutter-x-sm q-gutter-y-sm">
            <template v-for="(stage, i) in getSettings.stages">
              <select-stage
                :stageProp="stage.end"
                :key="i"
                :isDelStage="getSettings.stages.length > 1"
                @delStage="delStage(stage)"
                :categories="selectCategories(i)"
                :stages="selectStages(stage.end.category.ID)"
              ></select-stage>
            </template>
          </div>
        </div>
        <div class="row">
          <q-btn
            flat
            color="primary"
            label="Добавить еще"
            @click="addStage"
            v-if="getCategories.length > getSettings.stages.length"
          />
        </div>
        <div class="row">
          <p class="q-mt-sm q-mb-xs">
            Права пользователей для настройки приложения
          </p>
          <div class="col-12">
            <q-select
              filled
              dense
              label="Выберите пользователей"
              v-model="getSettings.usersSettingsRights"
              use-input
              use-chips
              multiple
              :options="options || getUserOptions"
              @filter="inputFilter"
              input-debounce="0"
              option-value="ID"
              option-label="NAME"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row">
          <p class="q-mt-sm q-mb-xs">
            Права пользователей для добавления операций
          </p>
          <div class="col-12">
            <q-select
              filled
              dense
              label="Выберите пользователей"
              v-model="getSettings.usersAddRights"
              use-input
              use-chips
              multiple
              :options="options || getUserOptions"
              @filter="inputFilter"
              input-debounce="0"
              option-value="ID"
              option-label="NAME"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row">
          <p class="q-mt-sm q-mb-xs">
            Список исключенных из статистики товаров
          </p>
          <div class="col-12">
            <q-select
              filled
              dense
              label="Выберите товары"
              v-model="getSettings.exceptionList"
              use-input
              use-chips
              multiple
              :options="productOptions || getProducts"
              @filter="inputProductFilter"
              input-debounce="0"
              option-value="ID"
              option-label="NAME"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row">
          <q-checkbox
            v-model="getSettings.infoToComments"
            label="5) Выводить подробную информацию о заказе в поле 'Комментарий'"
          />
        </div>
        <div class="row">
          <q-checkbox
            v-model="getSettings.hasEditBalance"
            label="6) Редактировать остатки"
          />
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat color="primary" label="Сохранить" @click="saveSettings" />
        <q-btn
          v-close-popup
          flat
          color="red"
          label="Отмена"
          @click="$emit('closeModal')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import selectStage from "./SelectStage";
import mixin from "../mixins/index";

export default {
  mixins: [mixin],
  props: {
    showModal: Boolean
  },
  data() {
    return {
      options: null,
      productOptions: null,
      defaultOptions: "getUserOptions"
    };
  },
  computed: {
    ...mapGetters("settings", [
      "getUsers",
      "getSettings",
      "getCategories",
      "getStages"
    ]),
    ...mapGetters("products", ["getProducts"]),

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
    ...mapActions("settings", ["addSettingsAPI"]),

    selectStages(category_id) {
      return this.getStages[category_id] || [];
    },

    selectCategories(index) {
      return this.getCategories.filter(category => {
        let stageIndex = this.getSettings.stages.findIndex(stage => {
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
      this.getSettings.stages.push({
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
      let index = this.getSettings.stages.indexOf(stage);
      this.getSettings.stages.splice(index, 1);
    },

    saveSettings() {
      let options = this.getSettings;
      this.addSettingsAPI({ options }).then(() => {
        this.showNotification(
          "positive",
          "Настройки сохранены"
        );
      });
    },

    inputProductFilter(val, update) {
      if (val === "" || !val) {
        update(() => {
          return this.getProducts;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.productOptions = this.getProducts.filter(v =>
          v.NAME.toLowerCase().includes(val) && !this.getSettings.exceptionList.includes(v.ID)
        );
      });
    }
  },
  components: {
    selectStage
  }
};
</script>

<style></style>
