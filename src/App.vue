<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {};
</script>

<style lang="scss">
th {
  font-weight: bold !important;
  white-space: normal !important;
}

.sticky-header-table {
  max-height: 100vh;

  th {
    background-color: #fff;
    top: 0px;
    position: sticky !important;
    z-index: 1 !important;
  }
}
</style>
