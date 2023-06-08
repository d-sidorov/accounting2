<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container v-if="!isLoad">
      <q-table
        :data="getData"
        :columns="columns"
        row-key="id"
        hide-bottom
        bordered
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:bottom-row>
          <q-tr>
            <q-td colspan="3"><b>ИТОГО</b></q-td>
            <q-td colspan="1">{{ getTotalPrice }} ₽</q-td>
          </q-tr>
          <q-tr>
            <q-td colspan="3"><b>ИТОГО (с учетом скидок)</b></q-td>
            <q-td colspan="1">{{ getTotalPriceWithDiscount }} ₽</q-td>
          </q-tr>
        </template>
      </q-table>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import mixin from "../mixins/index";
export default {
  mixins: [mixin],
  data() {
    return {
      isLoad: false,
      columns: [
        {
          name: "name",
          label: "Название",
          field: "name",
          sortable: false,
          align: "left",
          style: 'white-space: normal',
        },
        {
          name: "amount",
          label: "Кол-во",
          field: "amount",
          sortable: false,
          align: "left",
          style: 'max-width: 10%; ',
        },
        {
          name: "pricePerUnit",
          label: "Цена за ед.",
          field: "pricePerUnit",
          sortable: false,
          align: "left",
          style: 'max-width: 20%; ',
        },
        {
          name: "sum",
          label: "Сумма",
          field: "sum",
          sortable: false,
          align: "left",
          style: 'max-width: 20%;',
        }
      ]
    };
  },
  computed: {
    ...mapGetters("deals", ["getProductrows"]),
    getData() {
      return this.getProductrows.map(productrow => {
        return {
          id: productrow.ID,
          name: productrow.PRODUCT_NAME,
          amount: +productrow.QUANTITY,
          pricePerUnit: +productrow.PRICE_NETTO.toLocaleString() + '  ₽',
          sum: (productrow.PRICE_NETTO * productrow.QUANTITY).toLocaleString() + '  ₽'
        };
      });
    },

    getTotalPrice() {
      return this.getProductrows
        .reduce((acc, cur) => {
          return +acc + cur.PRICE_NETTO * cur.QUANTITY;
        }, 0).toLocaleString();
    },

    getTotalPriceWithDiscount() {
      return this.getProductrows
        .reduce((acc, cur) => {
          return +acc + cur.PRICE * cur.QUANTITY;
        }, 0).toLocaleString();
    }
  },
  created() {
    setTimeout(() => this.getProductrowsAPI(this.getPlacement.options.ENTITY_VALUE_ID), 1000)
  },
  methods: {
    ...mapActions("deals", ["getProductrowsAPI"])
  }
};
</script>

<style></style>
