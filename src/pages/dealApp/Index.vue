<template>
  <q-page>
    <Basket></Basket>
  </q-page>
</template>

<script>
import Basket from "../../components/dealCard/Basket";
import { mapActions } from "vuex";
import mixin from "../../mixins/index";

export default {
  mixins: [mixin],
  data() {
    return {
    };
  },
  components: {
    Basket,
  },
  created() {
    this.getProductrowsAPI(this.getPlacement.options.ID);
  },
  methods: {
    ...mapActions("deals", ["getProductrowsAPI"])
  }
};
</script>

<style></style>
