<template>
  <div class="q-pa-md">
    <q-table
      :data="getData"
      :columns="columns"
      row-key="id"
      hide-bottom
      flat
      bordered
      :rows-per-page-options="[0]"
      separator="cell"
    >
      <template v-slot:top class="q-pb-none">
        <div>
          <q-btn
            v-if="!isAddLocalProduct"
            class="q-mr-sm"
            color="primary"
            label="Добавить товар"
            @click="isAddLocalProduct = true"
          />
          <q-btn
            v-if="!isAddLocalProduct"
            color="primary"
            label="Склад"
            @click="showStoreModal = true"
          />
        </div>
      </template>

      <template v-slot:top-row v-if="isAddLocalProduct">
        <AddLocalProductTr
          @addLocalProduct="isAddLocalProduct = false"
          @cancel="isAddLocalProduct = false"
          :measures="getMeasures"
        />
      </template>

      <template v-slot:body="props">
        <BasketTr
          :props="props"
          :measures="getMeasures"
          :current-user="getCurrentUser"
        >
        </BasketTr>
      </template>

      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="6" class="text-weight-bold"
            >Итого (без учета скидок)</q-td
          >
          <q-td colspan="3"
            >{{ Number(getTotalWithoutDiscount).toLocaleString() }} ₽</q-td
          >
        </q-tr>
        <q-tr>
          <q-td colspan="6" class="text-weight-bold">Сумма скидки</q-td>
          <q-td colspan="3"
            >{{
              Number(getTotalWithoutDiscount - getTotalWithDiscount)
                .toFixed(2)
                .toLocaleString()
            }}
            ₽</q-td
          >
        </q-tr>
        <q-tr>
          <q-td colspan="6" class="text-weight-bold"
            >Итого (с учетом скидок)</q-td
          >
          <q-td colspan="3"
            >{{ Number(getTotalWithDiscount).toLocaleString() }} ₽</q-td
          >
        </q-tr>
      </template>
    </q-table>

    <store-modal
      :showModal="showStoreModal"
      @closeModal="showStoreModal = false"
    >
    </store-modal>
  </div>
</template>

<script>
import mixin from "../../mixins/index";
import { mapGetters } from "vuex";
import BasketTr from "./BasketTr";
import AddLocalProductTr from "../dealCard/AddLocalProductTr";
import StoreModal from "./StoreModal";

export default {
  mixins: [mixin],
  data() {
    return {
      columns: [
        {
          name: "name",
          align: "left",
          label: "Товар",
          field: "name",
          sortable: false,
          style: "width: 30%"
        },
        {
          name: "amount",
          align: "left",
          label: "Кол-во",
          field: "amount",
          sortable: false,
          style: "width: 100px"
        },
        {
          name: "measure",
          align: "left",
          label: "Ед.измерения",
          field: "measure",
          sortable: false
        },
        {
          name: "price",
          align: "left",
          label: "Стоимость",
          field: "price",
          sortable: false
        },
        {
          name: "discount",
          align: "left",
          label: "Скидка",
          field: "discount",
          sortable: false,
          style: "width: 200px"
        },
        {
          name: "total",
          align: "left",
          label: "ИТОГО",
          field: "total",
          sortable: false
        },
        {
          name: "totalWithDiscount",
          align: "left",
          label: "ИТОГО (со скидкой)",
          field: "totalWithDiscount",
          sortable: false
        },
        {
          name: "delete",
          align: "left",
          label: "",
          field: "delete",
          sortable: false
        }
      ],

      isAddLocalProduct: false,
      showStoreModal: false
    };
  },
  computed: {
    ...mapGetters("deals", ["getProductrows"]),
    ...mapGetters("settings", ["getMeasures", "getCurrentUser"]),
    ...mapGetters("operations", ["getOperations"]),

    getData() {
      return this.getProductrows
        .filter(productrow => {
          // return this.getOperations.find(oper => {
          //  return  oper.PROPERTY_VALUES.OBJECT_TYPE == "DEAL" &&
          //     oper.PROPERTY_VALUES.OBJECT == productrow.OWNER_ID &&
          //     oper.PROPERTY_VALUES.PRODUCT_ID == productrow.PRODUCT_ID;
          // });
          return productrow.OWNER_ID == this.getPlacement.options.ID
        })
        .map(productrow => {
          return {
            id: productrow.ID,
            product_id: productrow.PRODUCT_ID,
            name: productrow.PRODUCT_NAME,
            measure: productrow.MEASURE_CODE,
            amount: Number(productrow.QUANTITY),
            price: productrow.PRICE,
            priceBrutto: productrow.PRICE_BRUTTO,
            priceNetto: productrow.PRICE_NETTO,
            priceExclusive: productrow.PRICE_EXCLUSIVE,
            discountRate: productrow.DISCOUNT_RATE,
            discountSum: productrow.DISCOUNT_SUM,
            discountTypeId: productrow.DISCOUNT_TYPE_ID,
            ownerID: productrow.OWNER_ID,
          };
        });
    },

    getTotalWithDiscount() {
      return this.getProductrows
        .reduce((acc, cur) => {
          return (
            Number(acc) +
            Number((cur.PRICE_NETTO - cur.DISCOUNT_SUM) * cur.QUANTITY)
          );
        }, 0)
        .toFixed(2);
    },

    getTotalWithoutDiscount() {
      return this.getProductrows
        .reduce((acc, cur) => {
          return Number(acc) + Number(cur.PRICE_NETTO * cur.QUANTITY);
        }, 0)
        .toFixed(2);
    }
  },

  components: {
    BasketTr,
    AddLocalProductTr,
    StoreModal
  }
};
</script>

<style></style>
