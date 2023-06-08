<template>
  <div class="row q-gutter-x-sm">
    <div class="col-5">
      <q-select
        filled
        dense
        v-model="categoryModel"
        label="Направление сделки"
        :options="categories"
        option-value="ID"
        option-label="NAME"
      />
    </div>
    <div class="col-5">
      <q-select
        filled
        v-model="stageModel"
        dense
        label="Стадия сделки"
        :options="stages"
        option-value="STATUS_ID"
        option-label="NAME"
        map-options
      />
    </div>
    <div class="col">
      <q-btn v-if="isDelStage" color="red" icon-right="clear" @click="$emit('delStage')" />
    </div>
  </div>
</template>

<script>

export default {
  props: {
    stageProp: {
      type: Object,
      default: null,
    },
    isDelStage: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array,
      default: () => []
    },
    stages: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    categoryModel: {
      get() {
        return this.stageProp.category.NAME
      },
      set(val) {
        this.stageProp.category = val;
      }
    },
    stageModel: {
      get() {
        return this.stageProp.stage.NAME
      },
      set(val) {
        this.stageProp.stage = val;
      }
    },
  },
};
</script>

<style>
</style>