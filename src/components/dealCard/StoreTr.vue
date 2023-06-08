<template>
  <q-tr :props="props">
    <q-td
      key="name"
      :props="props"
      v-html="getProductLink(props.row.id)"
    ></q-td>
    <q-td key="priceNetto" :props="props">{{ props.row.priceNetto }}</q-td>
    <q-td key="storage_amount" :props="props">{{
      props.row.storage_amount
    }}</q-td>
    <q-td key="free_amount" :props="props">{{ props.row.free_amount }}</q-td>
    <q-td key="amount" :props="props">
      <q-input
        filled
        dense
        v-model="amount"
        label="Кол-во"
        type="number"
      />
    </q-td>
    <q-td key="measure" :props="props">
      <q-select
        filled
        dense
        v-model="measure"
        :options="measures"
        option-value="CODE"
        option-label="MEASURE_TITLE"
        emit-value
        map-options
      />
    </q-td>
    <q-td key="discount" :props="props">
      <div class="row items-center">
        <div class="col-6">
          <q-input
            filled
            dense
            v-model="discount"
            type="number"
            @focus="discount == 0 ? (discount = null) : (discount = discount)"
            @blur="!!!discount ? (discount = 0) : (discount = discount)"
          />
        </div>
        <div class="col-6">
          <q-btn
            size="sm"
            dense
            flat
            color="primary"
            v-if="discountTypeId == 1"
            @click="discountTypeId = 2"
            label="руб"
          />
          <q-btn
            size="sm"
            dense
            flat
            color="primary"
            v-if="discountTypeId == 2"
            @click="discountTypeId = 1"
            label="%"
          />
          <template v-if="discountTypeId == 1">
            /
            <q-btn
              size="sm"
              dense
              flat
              color="primary"
              v-if="discountType == 'ед'"
              @click="discountType = 'общ'"
              label="ед"
            />
            <q-btn
              size="sm"
              dense
              flat
              color="primary"
              v-if="discountType == 'общ'"
              @click="discountType = 'ед'"
              label="общ"
            />
          </template>
        </div>
      </div>
    </q-td>
    <q-td key="total" :props="props"
      >{{ getTotalWithDiscount(props.row.priceNetto, amount, discount) }} ₽
    </q-td>
    <q-td key="add" :props="props">
      <q-btn
        size="sm"
        round
        color="primary"
        icon="add"
        @click="addOperation()"
        v-if="!isAdded"
      />
      <q-btn
        size="sm"
        disabled
        round
        color="green"
        icon="done"
        v-if="isAdded"
        disable
      />
    </q-td>
  </q-tr>
</template>

<script>
import mixin from "../../mixins/index";
import { mapActions, mapMutations, mapGetters } from "vuex";

export default {
  props: {
    props: {
      type: Object
    },
    measures: {
      type: Array
    },
    currentUser: {
      type: Object
    }
  },
  mixins: [mixin],
  data() {
    return {
      amount: 1,
      measure: 0,
      discount: 0,
      discountTypeId: 1,
      discountType: "ед",
    };
  },
  created() {
    this.measure =
      this.measures.find(measure =>
        measure.MEASURE_TITLE.toLowerCase().includes("шт")
      ).CODE || this.measures[0].CODE;
  },
  computed: {
    ...mapGetters("deals", ["getProductrows"]),
    ...mapGetters("products", ["getProducts"]),

    isAdded() {
      return (
        this.getProductrows.findIndex(productrow => {
          return productrow.PRODUCT_ID == this.props.row.id;
        }) > -1
      );
    }
  },
  methods: {
    ...mapActions("operations", ["addOperationAPI"]),
    ...mapActions("deals", ["updateProductrowsAPI"]),
    ...mapMutations("deals", ["addProductRow"]),

    addOperation() {
      let operation = {
        PRODUCT_ID: this.props.row.id,
        TYPE: "EXPENSE",
        OBJECT_TYPE: "DEAL",
        DATE: this.getFormatDate(new Date()),
        OBJECT: this.getPlacement.options.ID,
        EMPLOYEE: this.currentUser.ID,
        AMOUNT: this.amount,
        COMMENT: ""
      };
      // this.addOperationAPI(operation)
      //   .then(() => {
        // })
        this.addProductrow()
        .then(() => {
          this.showNotification("positive", "Операция успешно добавлена");
        });
    },

    addProductrow() {
      let productrow = {
        ID: +new Date(),
        PRODUCT_ID: this.props.row.id,
        PRODUCT_NAME: this.props.row.name,
        PRICE_NETTO: this.props.row.priceNetto,
        PRICE_BRUTTO: this.props.row.priceNetto,
        MEASURE_CODE: this.measure,
        QUANTITY: this.amount,
        DISCOUNT_TYPE_ID: this.discountTypeId,
        OWNER_ID: this.getPlacement.options.ID
      };

      if (this.discountTypeId == 1) {
        if (this.discountType == "ед") {
          productrow.DISCOUNT_SUM = this.discount;
        } else if (this.discountType == "общ") {
          productrow.DISCOUNT_SUM = this.discount / this.amount;
        }
        let price = this.props.row.priceNetto - productrow.DISCOUNT_SUM;
        productrow.PRICE = productrow.PRICE_EXCLUSIVE = price;
      } else if (this.discountTypeId == 2) {
        productrow.DISCOUNT_RATE = this.getDiscountPrice(
          this.discount,
          this.props.row.priceNetto,
          this.amount
        );
        let price =
          this.props.row.priceNetto -
          (
            (this.props.row.priceNetto / 100) *
            productrow.DISCOUNT_RATE
          ).toFixed(1);
        productrow.PRICE = price;
        productrow.PRICE_EXCLUSIVE = price;
      }
      this.addProductRow(productrow);
      return this.updateProductrowsAPI(this.getPlacement.options.ID);
    }
  }
};
</script>

<style scoped>
.q-btn__wrapper {
  padding: 4px !important;
}
</style>
