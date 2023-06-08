<template>
  <q-dialog v-model="showModal" @hide="$emit('closeModal')">
    <q-card style="min-width: 500px">
      <q-toolbar>
        <p class="q-ma-none text-h6">Изменение состояния склада</p>
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

      <hr class="q-my-xs"/>

      <q-card-section class="q-gutter-y-md">
        <div class="row">
          <div class="col-12">
            <p class="q-mb-none">
              1) Товар
            </p>
          </div>
          <div class="col-12">
            <q-select
              required
              filled
              dense
              label="Товар"
              v-model="product"
              @filter="inputFilter"
              input-debounce="0"
              use-input
              :options="options || getProducts"
              option-value="ID"
              option-label="NAME"
              emit-value
              map-options
            />
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <p class="q-mb-none">
              2) Тип операции
            </p>
          </div>
          <div class="col-12 q-gutter-y-sm">
            <div class="col-12 q-gutter-y-sm">
              <q-select
                filled
                dense
                label="Тип операции"
                v-model="type"
                :options="types"
                option-value="ID"
                option-label="NAME"
                emit-value
                map-options
              />
            </div>
          </div>
        </div>
        <div class="row">
          <p class="q-mb-none">
            Количество
          </p>
          <div class="col-12">
            <q-input v-model.number="amount" type="number" filled dense />
          </div>
        </div>
        <div class="row">
          <p class="q-mb-none">
            Номер документа
          </p>
          <div class="col-12">
            <q-input v-model="number" type="text" filled dense />
          </div>
        </div>
        <div class="row">
          <p class="q-mb-none">
            Дата операции
          </p>
          <div class="col-12">
            <q-input filled dense v-model="date" mask="####-##-##">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="date" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Закрыть"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
        <div class="row">
          <p class="q-mb-none">
            Комментарий
          </p>
          <div class="col-12">
            <q-input v-model="comment" filled dense autogrow />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat color="primary" label="Добавить" @click="addOperation" />
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
import { mapGetters, mapActions } from "vuex";
import mixin from "../mixins/index";
export default {
  mixins: [mixin],
  props: {
    showModal: Boolean
  },
  data() {
    return {
      product: null,
      type: 'INCOME',
      amount: null,
      number: null,
      date: null,
      comment: null,

      types: [
        { ID: "EXPENSE", NAME: "Расход" },
        { ID: "INCOME", NAME: "Поступление" }
      ],

      options: null,
      defaultOptions: "getProducts"
    };
  },
  created() {
    this.date = this.getFormatDate(new Date());
  },
  computed: {
    ...mapGetters("products", ["getProducts"]),
    ...mapGetters("settings", ["getCurrentUser"])
  },
  methods: {
    ...mapActions("operations", ["addOperationAPI"]),
    ...mapActions("products", ["getProductsAPI"]),

    addOperation() {
      let checkfields = true
      if(this.product == null){
        checkfields = false
        // $q.notify({
        // type: 'negative',
        //   message: 'Выберете товар!'
        // })
        this.showNotification('negative', 'Выберете товар!');
        // return false;
      }
      if(this.amount == null){
        checkfields = false
        this.showNotification('negative', 'Введите количество!');

      }
      if(checkfields){

        let operation = {
          PRODUCT_ID: this.product,
          TYPE: this.type,
          OBJECT_TYPE: "NUMBER",
          DATE: this.date,
          OBJECT: this.number,
          EMPLOYEE: this.getCurrentUser.ID,
          AMOUNT: this.amount,
          COMMENT: this.comment
        };
        this.addOperationAPI(operation).then(() => {
          this.getProductsAPI();
            this.product = null;
            this.type = 'INCOME';
            this.amount = null;
            this.number = null;
            // this.date = null;
            this.comment = null;
          this.showNotification('positive', 'Операция успешно добавлена');
        });
      }

    }
  }
};
</script>

<style></style>
