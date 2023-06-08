<template>
  <q-tr>
    <q-td>
      <q-input v-model="name" dense filled label="Название товара"></q-input>
    </q-td>
    <q-td>
      <q-input
        v-model="amount"
        dense
        filled
        label="Количество товара"
      ></q-input>
    </q-td>
    <q-td
      ><q-select
        filled
        dense
        v-model="measure"
        :options="measures"
        option-value="CODE"
        option-label="MEASURE_TITLE"
        emit-value
        map-options
    /></q-td>
    <q-td>
      <q-input v-model="price" dense filled label="Стоимость"></q-input>
    </q-td>
    <q-td>
      <div class="row items-center">
        <div class="col-6">
          <q-input
            v-model="discount"
            dense
            filled
            label="Скидка"
            type="number"
            @focus="Number(discount) == 0 ? (discount = null) : (discount = discount)"
            @blur="!!!discount ? (discount = 0) : (discount = discount)"
          ></q-input>
        </div>
        <div class="col-6 items-center">
          <q-btn
            size="sm"
            flat
            color="primary"
            v-if="discountTypeId == 1"
            @click="discountTypeId = 2"
            label="руб"
          />
          <q-btn
            size="sm"
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
              flat
              color="primary"
              v-if="discountType == 'ед'"
              @click="discountType = 'общ'"
              label="ед"
            />
            <q-btn
              size="sm"
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
    <q-td>{{ getTotalPrice }}</q-td>
    <q-td>{{ getTotalWithDiscount(price, amount, discount) }}</q-td>
    <q-td>
      <div class="col-12 content-center">
        <q-btn
          round
          color="primary"
          size="sm"
          icon="add"
          @click="addLocalProduct"
        />
        <q-btn
          round
          color="red"
          size="sm"
          icon="close"
          @click="cancelAddLocalProduct"
        />
      </div>
    </q-td>
  </q-tr>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import mixin from "../../mixins/index";

export default {
  mixins: [mixin],
  props: {
    measures: {
      type: Array
    }
  },
  data() {
    return {
      discountType: "ед",
      discountTypeId: 1,
      id: null,
      name: null,
      measure: null,
      amount: null,
      price: null,
      discount: null,
      ownerId: null
    };
  },
  computed: {
    ...mapGetters("deals", ["getProductrows"]),

    productrow() {
      return this.getProductrows.find(
        productrow => productrow.ID == this.props.row.id
      );
    },

    getTotalPrice() {
      return this.price * this.amount;
    }
  },
  methods: {
    ...mapMutations("deals", ["addProductRow"]),
    ...mapActions("deals", ["updateProductrowsAPI"]),

    cancelAddLocalProduct() {
      this.$emit("cancel");
    },

    addLocalProduct() {
      let productrow = {
        ID: +new Date(),
        PRODUCT_ID: +new Date(),
        PRODUCT_NAME: this.name,
        PRICE_NETTO: +this.price,
        PRICE_BRUTTO: +this.price,
        MEASURE_CODE: this.measure,
        QUANTITY: +this.amount,
        DISCOUNT_TYPE_ID: this.discountTypeId,
        OWNER_ID: this.getPlacement.options.ID
      };

      if (this.discountTypeId == 1) {
        if (this.discountType == "ед") {
          productrow.DISCOUNT_SUM = +this.discount;
        } else if (this.discountType == "общ") {
          productrow.DISCOUNT_SUM = +(this.discount / this.amount);
        }
        let price = +(this.price - productrow.DISCOUNT_SUM);
        productrow.PRICE = productrow.PRICE_EXCLUSIVE = +price;
      } else if (this.discountTypeId == 2) {
        productrow.DISCOUNT_RATE = this.getDiscountPrice(
          +this.discount,
          +this.price,
          +this.amount
        );
        let price =
          this.price -
          ((this.price / 100) * productrow.DISCOUNT_RATE).toFixed(1);
        productrow.PRICE = +price;
        productrow.PRICE_EXCLUSIVE = +price;
      }
      this.addProductRow(productrow);
      this.updateProductrowsAPI(this.getPlacement.options.ID).then(() => {
        this.showNotification("positive", "Товар успешно добавлен");
        this.$emit("addLocalProduct");
      });
    }
  }
};
</script>

<style scoped>
.q-btn__wrapper {
  padding: 4px !important;
}
</style>
