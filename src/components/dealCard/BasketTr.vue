<template>
  <q-tr :props="props">
    <q-td
      key="name"
      :props="props"
      v-html="getProductLink(props.row.product_id) || props.row.name"
    ></q-td>
    <q-td key="amount" :props="props">
      <q-input
        filled
        dense
        v-model.lazy="amount"
        label="Кол-во"
        type="number"
        @change="changeValue()"
      />
    </q-td>
    <q-td key="measure" :props="props"
      ><q-select
        filled
        dense
        v-model.lazy="measure"
        :options="measures"
        option-value="CODE"
        option-label="MEASURE_TITLE"
        emit-value
        map-options
        @input="changeValue()"
    /></q-td>
    <q-td key="price" :props="props">
      <q-input
        filled
        dense
        v-model.lazy="price"
        label="Цена"
        type="number"
        @change="changeValue()"
      />
    </q-td>
    <q-td key="discount" :props="props">
      <div class="row items-center">
        <div class="col-6">
          <q-input
            filled
            dense
            v-model.lazy="discount"
            type="number"
            @change="changeValue()"
            @focus="
              Number(discount) == 0 ? (discount = null) : (discount = discount)
            "
            @blur="!!!discount ? (discount = 0) : (discount = discount)"
          />
        </div>
        <div class="col-6 items-center">
          <q-btn
            size="sm"
            dense
            flat
            color="primary"
            v-if="discountTypeId == 1"
            @click="(discountTypeId = 2), changeValue()"
            label="руб"
          />
          <q-btn
            size="sm"
            dense
            flat
            color="primary"
            v-if="discountTypeId == 2"
            @click="(discountTypeId = 1), changeValue()"
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
              @click="(discountType = 'общ'), changeValue()"
              label="ед"
            />
            <q-btn
              size="sm"
              dense
              flat
              color="primary"
              v-if="discountType == 'общ'"
              @click="(discountType = 'ед'), changeValue()"
              label="общ"
            />
          </template>
        </div>
      </div>
    </q-td>
    <q-td key="total" :props="props"
      >{{ getTotalPrice.toLocaleString() }} ₽</q-td
    >
    <q-td key="totalWithDiscount" :props="props"
      >{{
        getTotalWithDiscount(
          props.row.priceNetto,
          amount,
          discount
        ).toLocaleString()
      }}
      ₽</q-td
    >
    <q-td key="delete"
      ><q-btn
        size="sm"
        round
        color="red"
        icon="close"
        @click="delOperation()"
        :disabled="
          !getSettings.usersSettingsRights.includes(getCurrentUser.ID) && !isAdmin
        "
    /></q-td>
  </q-tr>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import mixin from "../../mixins/index";

export default {
  mixins: [mixin],
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
  data() {
    return {
      discountType: "ед",
      discountTypeId: 1,
      discount: 0
    };
  },
  mounted() {
    this.discountTypeId = this.props.row.discountTypeId;
    if (this.discountTypeId == 1) {
      this.discount = this.props.row.discountSum;
    } else if (this.discountTypeId == 2) {
      this.discount = this.props.row.discountRate;
    }
  },
  computed: {
    ...mapGetters("deals", ["getProductrows"]),
    ...mapGetters("products", ["getProducts"]),
    ...mapGetters("settings", ["getCurrentUser"]),
    ...mapGetters("operations", ["getOperations"]),

    productrow() {
      return this.getProductrows.find(
        productrow => productrow.ID == this.props.row.id
      );
    },

    operation() {
      return this.getOperations.find(operation => {
        return (
          operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL" &&
          operation.PROPERTY_VALUES.OBJECT == this.props.row.ownerID &&
          operation.PROPERTY_VALUES.PRODUCT_ID == this.props.row.product_id
        );
      });
    },

    getTotalPrice() {
      return this.price * this.amount;
    },

    measure: {
      get() {
        return this.props.row.measure;
      },
      set(val) {
        this.productrow.MEASURE_CODE = val;
      }
    },
    amount: {
      get() {
        return this.props.row.amount;
      },
      set(val) {
        this.productrow.QUANTITY = val;
      }
    },
    price: {
      get() {
        return this.props.row.priceNetto;
      },
      set(val) {
        this.productrow.PRICE_NETTO = this.productrow.PRICE_EXCLUSIVE = val;
      }
    }
  },
  methods: {
    ...mapMutations("deals", ["deleteProductrow"]),
    ...mapActions("deals", ["updateProductrowsAPI"]),
    ...mapActions("operations", ["deleteOperationAPI", 'updateOperationAPI']),

    changeValue() {
      let productrow = this.productrow;

      if (productrow) {
        productrow.MEASURE_CODE = this.measure;
        productrow.QUANTITY = this.amount;
        productrow.PRICE_NETTO = productrow.PRICE_EXCLUSIVE = this.price;
        productrow.DISCOUNT_TYPE_ID = this.discountTypeId;

        if (this.discountTypeId == 1) {
          if (this.discountType == "ед") {
            productrow.DISCOUNT_SUM = this.discount;
          } else if (this.discountType == "общ") {
            productrow.DISCOUNT_SUM = this.discount / this.amount;
          }
          let price = this.props.row.priceNetto - productrow.DISCOUNT_SUM;
          productrow.PRICE = productrow.PRICE_EXCLUSIVE = price;
        } else if (this.discountTypeId == 2) {
          productrow.DISCOUNT_RATE = this.discount;
          let price =
            this.price -
            (
              (this.props.row.priceNetto / 100) *
              productrow.DISCOUNT_RATE
            ).toFixed(2);
          productrow.PRICE = price;
          productrow.PRICE_EXCLUSIVE = price;
        }
      }
      this.updateProductrowsAPI(this.getPlacement.options.ID)
        .then(() => {
          let fields = {
            AMOUNT: this.amount
          };
          if (this.operation) return this.updateOperationAPI({id: this.operation.ID, fields});
          else return Promise.resolve();
        })
        .then(() => {
          this.showNotification("positive", "Операция успешно изменена");
        });
    },

    delOperation() {
      if (
        !this.getSettings.usersAddRights.includes(this.getCurrentUser.ID) &&
        !this.isAdmin
      ) {
        this.showNotification("negative", "Недостаточно прав");
        return;
      }

      this.deleteRow(this.props.row.id, this.props.row.ownerID);
      if (this.operation) this.deleteOperationAPI(this.operation.ID);
    }
  }
};
</script>

<style scoped>
.q-btn__wrapper {
  padding: 4px !important;
}
</style>
