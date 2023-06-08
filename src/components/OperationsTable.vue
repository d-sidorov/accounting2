<template>
  <q-table
    :data="getData"
    :columns="columns"
    row-key="id"
    flat
    bordered
    :rows-per-page-options="[0]"
    :filter="filter"
    :sort-method="sortMethod"
    :filter-method="filterMethod"
    :loading="loading"
    binary-state-sort
    virtual-scroll
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
          <br />
          <q-btn-dropdown
            icon="filter_alt"
            v-if="col.name == 'type'"
            size="xs"
            :dropdown-icon="false"
          >
            <q-list>
              <q-item>
                <q-checkbox
                  v-model="filter.operationTypesFilter"
                  val="INCOME"
                  label="Поступление"
                />
              </q-item>
              <q-item>
                <q-checkbox
                  v-model="filter.operationTypesFilter"
                  val="EXPENSE"
                  label="Расход"
                />
              </q-item>
              <q-item>
                <q-checkbox
                  v-model="filter.operationTypesFilter"
                  val="EXPENSE_PLAN"
                  label="Планируемый расход"
                />
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn-dropdown
            icon="today"
            v-if="col.name == 'date'"
            size="xs"
            @click.stop.prevent
            :dropdown-icon="false"
          >
            <div class="column">
              <div class="col">
                <q-date v-model="filter.dateOperationsFilter" range today-btn />
              </div>
              <div class="col">
                <q-btn
                  size="sm"
                  flat
                  color="red"
                  @click="
                    filter.dateOperationsFilter.from = filter.dateOperationsFilter.to = null
                  "
                  label="Отчистить"
                />
              </div>
            </div>
          </q-btn-dropdown>
        </q-th>
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr @click="props.expand = !props.expand">
        <q-td key="type">{{ getTypeValue(props.row.type) }}</q-td>
        <q-td key="amount">{{ props.row.amount }}</q-td>
        <q-td key="date">{{
          props.row.date
            .split("-")
            .reverse()
            .join(".")
        }}</q-td>
        <q-td key="object" v-html="getObjectLink(props.row.id)"></q-td>
        <q-td key="employe" v-html="getUserLink(props.row.employe)"></q-td>
        <q-td key="comment">{{ props.row.comment }}</q-td>
        <q-td
          ><q-btn
            size="sm"
            round
            color="red"
            icon="close"
            @click="delOperation(props.row)"
            :disabled="
              !getSettings.usersSettingsRights.includes(getCurrentUser.ID) &&
                !isAdmin
            "
        /></q-td>
      </q-tr>
    </template>
    <template v-slot:loading>
      <q-inner-loading showing color="primary" style="z-index:199999999;"/>
    </template>
  <template v-slot:bottom >
    <div class="q-pa-lg flex flex-center" style="margin:0 auto;">
      <q-pagination
        v-model="pagination.currentPage"
        :max="pagination.maxPage"
        boundary-numbers
        max-pages="6"
      />
    </div>
  </template>
</q-table>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import  Axios  from "axios";
import mixin from "../mixins/index";

export default {
  name: "OperationsRows",
  mixins: [mixin],
  props: {
    operations: {
      type: Array,
      default: () => []
    },
    productId: {
      type: Number,
      default: 0  
    }
  },
  data() {
    return {
      pagination: {
        currentPage: 1,
        maxPage: 5,
      },
      sortObj:{
        'PROPERTY_DATE':"DESC"
      },
      columns: [
        {
          name: "type",
          align: "left",
          label: "Тип операции",
          field: "type",
          sortable: false
        },
        {
          name: "amount",
          align: "left",
          label: "Количество",
          field: "amount",
          sortable: true
        },
        {
          name: "date",
          align: "left",
          label: "Дата операции",
          field: "date"
          // sortable: true
        },
        {
          name: "object",
          align: "left",
          label: "Объект операции",
          field: "object",
          sortable: false
        },
        {
          name: "employe",
          align: "left",
          label: "Сотрудник",
          field: "employe",
          sortable: false
        },
        {
          name: "comment",
          align: "left",
          label: "Комментарий",
          field: "comment",
          sortable: false
        },
        {
          name: "comment",
          align: "left",
          label: "",
          field: "comment",
          sortable: false
        }
      ],
      filter: {
        operationTypesFilter: ["INCOME", "EXPENSE",'EXPENSE_PLAN'],
        dateOperationsFilter: {
          from: null,
          to: null
        }
      },
      loading: false
    };
  },
  computed: {
    ...mapGetters("settings", ["getUsers", "getSettings", "getCurrentUser"]),
    // ...mapGetters("operations", ["getOperations"]),
    ...mapGetters("deals", ["getDeals", "getProductrows"]),

     getData() {
      
      return this.operations
        .map(operation => {
          return {
            id: operation.ID,
            type: operation.PROPERTY_VALUES.TYPE,
            amount: operation.PROPERTY_VALUES.AMOUNT,
            date: operation.PROPERTY_VALUES.DATE,
            object: operation.PROPERTY_VALUES.OBJECT,
            objectType: operation.PROPERTY_VALUES.OBJECT_TYPE,
            employe: operation.PROPERTY_VALUES.EMPLOYEE,
            comment: operation.PROPERTY_VALUES.COMMENT,
            productId: operation.PROPERTY_VALUES.PRODUCT_ID
          };
        })
        .sort((a, b) => {
          return +new Date(b.date) - +new Date(a.date);
        });
    }
  },
  beforeMount() {
    this.loading = true
    Axios.get("https://uchet.tovarov.simbirbit.ru/uchet_ajax/ajax_get.php",{params:{AUTH:BX24.getAuth(),METHOD:"entity.item.get",PARAMS:{ENTITY: "operationsB24app",FILTER:{PROPERTY_PRODUCT_ID:this.productId}}}}).then(res=>{ 
      let data =  JSON.parse(res.data)
      this.operations = data.result;
      this.pagination.maxPage = Math.ceil(data.total/50) 
      this.loading = false

      })
  },
  mounted(){
    console.log(this.operations);
  },
  methods: {
    ...mapActions("operations", ["deleteOperationAPI"]),
    ...mapActions("deals", ["updateProductrowsAPI", 'getProductrowsAPI']),
    ...mapMutations("deals", ["deleteProductrow"]),

    getOperationsReal(){
      this.loading = true

      // arFilter = this.filter;
      let arFilter = {
        PROPERTY_TYPE: this.filter.operationTypesFilter,
      }
      if(this.filter.dateOperationsFilter.from){
        arFilter[">=PROPERTY_DATE"] = this.filter.dateOperationsFilter.from.split('/').join('-')
      }
      if(this.filter.dateOperationsFilter.to){
        arFilter["<=PROPERTY_DATE"] = this.filter.dateOperationsFilter.to.split('/').join('-')
      }
      arFilter.PROPERTY_PRODUCT_ID = this.productId;
      Axios.get("https://uchet.tovarov.simbirbit.ru/uchet_ajax/ajax_get.php",{params:{AUTH:BX24.getAuth(),METHOD:"entity.item.get",PARAMS:{ENTITY: "operationsB24app",FILTER:arFilter ,SORT:this.sortObj,start: (this.pagination.currentPage-1) * 50}}}).then(res=>{ 
      let data =  JSON.parse(res.data)
      this.operations = data.result;
      this.loading = false
      // this.pagination.maxPage = Math.ceil(data.total/50) 
      })
    },
    test(newVal){
      console.log(newVal)
    },
    getDeal(operation) {
      return this.getDeals.find(deal => {
        return (
          operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL" &&
          operation.PROPERTY_VALUES.OBJECT == deal.ID
        );
      });
    },
    sortMethod(rows,sortBy,descBool){
      let fakesortObj = {};
       fakesortObj['PROPERTY_' + sortBy] = (descBool)?"DESC":"ASC";
       if(this.sortObj.hasOwnProperty('PROPERTY_DATE')) {
         delete  this.sortObj['PROPERTY_DATE'];
       }
      if(this.sortObj.hasOwnProperty('PROPERTY_' + sortBy)){
        if(fakesortObj['PROPERTY_' + sortBy]  != this.sortObj['PROPERTY_' + sortBy]){
          this.sortObj['PROPERTY_' + sortBy] = fakesortObj['PROPERTY_' + sortBy]
          this.getOperationsReal()
        }
      }else{
          this.sortObj['PROPERTY_' + sortBy] = fakesortObj['PROPERTY_' + sortBy]
          this.getOperationsReal()

      }

      console.log(this.sortObj);
      return rows;
    },
    filterMethod(rows) {

      // this.getOperationsReal(arFilter)
      // return this.operations;
       return rows;
      // return rows.filter(row => {
      //   if (!this.filter.operationTypesFilter.includes(row.type)) return false;
      //   if (this.filter.dateOperationsFilter.from) {
      //     if (
      //       +new Date(row.date) <
      //       +new Date(this.filter.dateOperationsFilter.from)
      //     )
      //       return false;
      //   }
      //   if (this.filter.dateOperationsFilter.to) {
      //     if (
      //       +new Date(row.date) > +new Date(this.filter.dateOperationsFilter.to)
      //     )
      //       return false;
      //   }
      //   return true;
      // });
    },
 
    getTypeValue(type) {
      if (type == "EXPENSE") return "Расход";
      if (type == "EXPENSE_PLAN") return "Планируемый расход";
      if (type == "INCOME") return "Поступление";
    },

    getObjectLink(id) {
      let operation = this.operations.find(operation => operation.ID == id);
      if (operation) {
        if (operation.PROPERTY_VALUES.OBJECT_TYPE == "DEAL") {
          //     return Axios.get("https://uchet.tovarov.simbirbit.ru/uchet_ajax/ajax_get.php",{params:{AUTH:BX24.getAuth(),METHOD:"crm.deal.get",PARAMS:{ID:  operation.PROPERTY_VALUES.OBJECT}}}).then(res=>{
          //       return `<a href="https://${BX24.getDomain()}/crm/deal/details/${
          //   res.data().ID
          // }/" target="_blank">`+res.data().TITLE+ `</a>`;
          //     })
          return `<a href="https://${BX24.getDomain()}/crm/deal/details/${
            operation.PROPERTY_VALUES.OBJECT
          }/" target="_blank">Сделка</a>`;
        } else {
          return operation.PROPERTY_VALUES.OBJECT;
        }
      }
    },
    getUserLink(user_id) {
      let user = this.getUsers.find(user => user.ID == user_id);
      if (user) {
        return `<a href="https://${BX24.getDomain()}/company/personal/user/${
          user.ID
        }/" target="_blank">${user.NAME} ${user.LAST_NAME}</a>`;
      } else {
        return "Пользователь не найден";
      }
    },
    delOperation(operation) {
      if (
        !this.getSettings.usersAddRights.includes(this.getCurrentUser.ID) &&
        !this.isAdmin
      ) {
        this.showNotification("negative", "Недостаточно прав");
        return;
      }
      if (operation.objectType == 'DEAL') {
        this.getProductrowsAPI([operation.object]).then(productrows => {
          let index = productrows.findIndex(prodrow => {
            return prodrow.PRODUCT_ID == operation.productId
          });
          if (index > -1) {
            this.deleteProductrow(index);
            return this.updateProductrowsAPI(operation.object);
          } else return Promise.resolve();
        }).then(() => {
          this.deleteOperationAPI(operation.id)
        })
      } else {
        this.deleteOperationAPI(operation.id)
      }
    }
  },
  watch: {
    pagination:{
      deep : true,
      handler() {
            this.getOperationsReal()
          }
    },
    filter:{
      deep : true,
      handler() {
            this.getOperationsReal()
          }
    },

  },
};
</script>

<style></style>
