<template>
  <q-page>
    <q-btn
      class="fixed-top-left z-top"
      round
      color="primary"
      icon="settings"
      @click="showSettingModal = true"
      v-if="
        getSettings.usersSettingsRights.includes(getCurrentUser.ID) || isAdmin
      "
    />
    <q-btn
      class="fixed-top-right z-top"
      round
      color="primary"
      icon="add"
      @click="showAddOperationModal = true"
      v-if="getSettings.usersAddRights.includes(getCurrentUser.ID) || isAdmin"
    />

    <q-table
      class="sticky-header-table"
      :data="getData"
      :columns="columns"
      row-key="ID"
      hide-bottom
      :rows-per-page-options="[0]"
      :filter="filter"
      :filter-method="filterMethod"
      :sort-method="sort"
      binary-state-sort
      separator="cell"
      virtual-scroll
      :pagination.sync="pagination"
    >
      <template v-slot:top>
        <div class="row col-12">
          <div class="col-5">
            <p class="column items-center text-h5">Учет товаров на складе</p>
          </div>
          <div class="col-6">
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
        <q-tr :class="props.expand ? 'bg-green-11' : ''"
        >
          <q-td @click="props.expand = !props.expand"  key="name" v-html="getProductLink(props.row.ID)"></q-td>
          <q-td @click="props.expand = !props.expand"  key="planed_expense">{{ props.row.planed_expense }}</q-td>
          <q-td @click="props.expand = !props.expand"  key="free_amount">{{ props.row.free_amount }}</q-td>
          <q-td @click="props.expand = !props.expand"  key="storage_amount">{{ props.row.storage_amount }}</q-td>
          <q-td  v-if="getSettings.hasEditBalance == true && (getSettings.usersAddRights.includes(getCurrentUser.ID) || isAdmin)">
            <q-btn label="" color="primary" round @click="editBalance(props.row)" icon="edit" size="sm">
              <!-- <svg class="q-icon" aria-hidden="true" role="presentation" viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path></svg> -->
            </q-btn>
            
          </q-td>
        </q-tr>
        <q-tr v-if="props.expand">
          <td colspan="5" class="bg-grey-4">
            <operations-table
              class="operations-table"
              :operations="getOperationsByProductId(props.row.ID)"
              :product-id="props.row.ID"
            ></operations-table>
          </td>
        </q-tr>
      </template>
    </q-table>
    <settings-modal
      :showModal="showSettingModal"
      @closeModal="showSettingModal = false"
    ></settings-modal>
    <add-operation-modal
      :showModal="showAddOperationModal"
      @closeModal="showAddOperationModal = false"
    ></add-operation-modal>
    <q-dialog v-model="modalEditBalance" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6" >Редактирование остатков {{editBalanceProductName}}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div style="display:flex;">

          <q-input  label-slot  stack-label dense type="number" v-model="editBalancePlaned"  input-style="text-align: center;">
          <template v-slot:label>
            <div style="text-align: center;">
              Планируемый расход
            </div>

          </template>
          </q-input>
          <q-input  bg-color="grey"  label-slot  stack-label dense type="number" :value="(editBalanceStorage - editBalancePlaned).toFixed(2)" readonly input-style="text-align: center;"> 
          <template v-slot:label>
            <div style="text-align: center;">
              Свободный остаток
            </div>

          </template>
          </q-input>
          <q-input  label-slot  stack-label  dense type="number" v-model="editBalanceStorage" input-style="text-align: center;">
                      <template v-slot:label>
            <div style="text-align: center;">
              Остаток на складе
            </div>

          </template>
          </q-input>

          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Сохранить" @click="saveBalance()"/>
          <q-btn flat label="Отмена" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapGetters,mapActions } from "vuex";
import operationsTable from "../../components/OperationsTable";
import settingsModal from "../../components/settingsModal.vue";
import addOperationModal from "../../components/addOperationModal.vue";
import mixin from "../../mixins/index";

export default {
  name: "PageIndex",
  mixins: [mixin],
  data() {
    return {
      columns: [
        {
          name: "name",
          align: "left",
          label: "Название товара",
          field: "name",
          sortable: true,
          headerStyle: "z-index: 100 !important"
        },
        {
          name: "planed_expense",
          align: "left",
          label: "Планируемый расход",
          field: "planed_expense",
          sortable: true,
          headerStyle: "z-index: 100 !important"
        },
        {
          name: "free_amount",
          align: "left",
          label: "Свободный остаток",
          field: "free_amount",
          sortable: true,
          headerStyle: "z-index: 100 !important"
        },
        {
          name: "storage_amount",
          align: "left",
          label: "Остаток на складе",
          field: "storage_amount",
          sortable: true,
          headerStyle: "z-index: 100 !important"
        }
      ],
      editBalanceID:0,
      editBalanceProductName:"",
      editBalancePlaned:0,
      editBalanceStorage:0,
      modalEditBalance:false,
      pagination: {
        rowsPerPage: 0
      },
      showSettingModal: false,
      showAddOperationModal: false,

      filter: null,
      options: null,
      defaultOptions: "getProducts"
    };
  },
  computed: {
    ...mapGetters("products", ["getProducts"]),
    ...mapGetters("operations", ["getOperationsByProductId", "getOperations"]),
    ...mapGetters("settings", ["getSettings", "getCurrentUser"]),
    ...mapGetters("deals", ["getProductrows"]),

    getData() {
      return this.getProducts
        .map( product => {
          // let balanceProduct  = this.getBalanceProduct(product.ID).then(res=>{return res})
          return Object.assign({
            ID: product.ID,
            name: product.NAME,
            planed_expense:product.planed_expense,
            free_amount:product.free_amount,
            storage_amount:product.storage_amount,
          },
          );
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
     ...mapActions("products", ["getProductsAPI"]),
    filterMethod(rows, terms) {
      if (terms.length == 0) return rows;
      return rows.filter(row => {
        return terms.includes(row.ID);
      });
    },
    editBalance(product){
      this.editBalanceID = product.ID;
      this.editBalanceProductName = product.name;
      this.modalEditBalance = true;
      this.editBalanceStorage = parseFloat(product.storage_amount).toFixed(2);
      this.editBalancePlaned = parseFloat(product.planed_expense).toFixed(2);
    },
    saveBalance(){
      BX24.callMethod('entity.item.get',{'ENTITY':"balanceStore",'FILTER':{'PROPERTY_ID_PRODUCT':this.editBalanceID}},(result)=>{
          if( result.data().length == 0){
            BX24.callMethod('entity.item.add',{'ENTITY':"balanceStore","NAME":"balance","PROPERTY_VALUES":{BALANCE: this.editBalanceStorage,PLAN_MINUS: this.editBalancePlaned,'ID_PRODUCT':this.editBalanceID}},(result)=>{

              this.modalEditBalance = false;
              this.editBalanceStorage = 0
              this.editBalancePlaned = 0
              this.editBalanceID = 0
              this.getProductsAPI();
            })
          }else{
            let idBalanceStore = result.data()[0].ID

            BX24.callMethod('entity.item.update',{'ENTITY':"balanceStore",'ID':idBalanceStore,"PROPERTY_VALUES":{BALANCE: this.editBalanceStorage,PLAN_MINUS: this.editBalancePlaned}},(result)=>{

              this.modalEditBalance = false;
              this.editBalanceStorage = 0
              this.editBalancePlaned = 0
              this.editBalanceID = 0
              this.getProductsAPI();
            })
          }

      })

    }
  },
  components: {
    operationsTable,
    settingsModal,
    addOperationModal
  }
};
</script>

<style lang="scss">
.operations-table {
  max-height: 400px;
}
</style>
