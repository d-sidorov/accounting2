<template>
  <q-dialog v-model="showModal" full-width>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          @click="$emit('closeModal')"
        />
      </q-card-section>
      <q-card-section>
        <q-table
          class="sticky-header-table"
          :data="getData"
          :columns="columns"
          separator='cell'
          row-key="id"
          hide-bottom
          flat
          bordered
          :rows-per-page-options="[0]"
          :sort-method="sort"
          binary-state-sort
          :filter="filter"
          :filter-method="filterMethod"
        >
          <template v-slot:top>
            <div class="row col-12">
              <div class="col-5">
                <p class="column text-h5">Склад</p>
              </div>
              <div class="col-7">
                <q-select
                  filled
                  dense
                  label="Товары"
                  v-model="filter"
                  use-input
                  @filter="inputFilter"
                  input-debounce="0"
                  use-chips
                  multiple
                  :options="options || getFilterProducts"
                  option-value="ID"
                  option-label="NAME"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-select>
              </div>
            </div>
          </template>
          <template v-slot:body="props">
            <StoreTr
              :props="props"
              :measures="getMeasures"
              :current-user="getCurrentUser"
            ></StoreTr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import StoreTr from "./StoreTr";
import mixin from "../../mixins/index";

export default {
  mixins: [mixin],
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      columns: [
        {
          name: "name",
          align: "left",
          label: "Товар",
          field: "name",
          sortable: true,
          headerClasses: "text-bold"
        },
        {
          name: "priceNetto",
          align: "left",
          label: "Стоимость",
          field: "priceNetto",
          sortable: true
        },
        {
          name: "storage_amount",
          align: "left",
          label: "Остаток на складе",
          field: "storage_amount",
          sortable: true,
          style: "white-space: normal; word-break: break-all;"
        },
        {
          name: "free_amount",
          align: "left",
          label: "Свободный остаток",
          field: "free_amount",
          sortable: true,
          style: "white-space: normal; word-break: break-all;"
        },
        {
          name: "amount",
          align: "left",
          label: "Количество",
          field: "amount",
          sortable: false
        },
        {
          name: "measure",
          align: "left",
          label: "Ед.измерения",
          field: "measure",
          sortable: false
        },
        {
          name: "discount",
          align: "left",
          label: "Скидка",
          field: "discount",
          sortable: false
        },
        {
          name: "total",
          label: "Итого",
          field: "total",
          sortable: false
        },
        {
          name: "add",
          align: "left",
          label: "",
          field: "add",
          sortable: false
        }
      ],
      options: null,
      defaultOptions: "getProducts",
      filter: null
    };
  },
  computed: {
    ...mapGetters("products", ["getProducts"]),
    ...mapGetters("settings", ["getMeasures", "getCurrentUser", "getSettings"]),

    getData() {
      return this.getProducts
        .map(product => {
          return {
            id: product.ID,
            name: product.NAME,
            priceNetto: product.PRICE,
            storage_amount:product.storage_amount,
            free_amount: product.free_amount,
            amount: 0,
            measure: null,
            discount: 0,
            discount_type: null,
            total: null
          };
        })
        .filter(product => {
          if (this.getSettings.exceptionList)
            return !this.getSettings.exceptionList.includes(product.ID);
          return true;
        });
    },

    getFilterProducts() {
      return this.getProducts.filter(product => {
        if (this.getSettings.exceptionList)
          return !this.getSettings.exceptionList.includes(product.ID);
        return true;
      });
    }
  },
  methods: {
    filterMethod(rows, terms) {
      if (terms.length == 0) return rows;
      return rows.filter(row => {
        return terms.includes(row.id);
      });
    }
  },
  components: {
    StoreTr
  }
};
</script>

<style></style>
