import { batchRequest, request } from "../functions";
function x(productrow) {
  let t = `\n  <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">\n      <thead>\n          <tr>\n              <th style="padding: 10px; border: 1px solid black">Название</th>\n              <th style="padding: 10px; border: 1px solid black">Кол-во</th>\n              <th style="padding: 10px; border: 1px solid black">Цена за ед.</th>\n              <th style="padding: 10px; border: 1px solid black">Сумма</th>\n          </tr>\n      </thead>\n      <tbody>\n         ${U(productrow)}\n      </tbody>\n  </table>\n  <strong>Комментарий оставлять ниже этой полосы</strong> <hr>`;
  return t
}
function U(productrow) {
  let t = "",
      r = 0,
      n = 0;
  return 0 == productrow.length ? '<tr> <td colspan="4" style="padding: 10px; border: 1px solid black">Нет прикрепленных товаров</td></tr>' : (productrow.forEach((e => {
      t += `\n      <tr>\n          <td style="padding: 10px; border: 1px solid black">${e.PRODUCT_NAME}</td>\n          <td style="padding: 10px; border: 1px solid black">${e.QUANTITY}</td>\n          <td style="padding: 10px; border: 1px solid black">${e.PRICE_NETTO}</td>\n          <td style="padding: 10px; border: 1px solid black">${e.PRICE_NETTO*e.QUANTITY}</td>\n      </tr>\n      `;
      let a = e.PRICE_NETTO * e.QUANTITY;
      r += a, 2 == e.DISCOUNT_TYPE_ID ? n += a - a / 100 * parseInt(e.DISCOUNT_RATE) : 1 == e.DISCOUNT_TYPE_ID && (n += a - Number(e.DISCOUNT_SUM) * e.QUANTITY)
  })), t += `\n  <tr>\n   <td style="padding: 10px; border: 1px solid black" colspan="3"><b>Итого<b></td>\n   <td style="padding: 10px; border: 1px solid black">${r} руб</td>\n  </tr>\n  `, t += `\n  <tr>\n   <td style="padding: 10px; border: 1px solid black" colspan="3"><b>Итого (с учетом скидок)<b></td>\n   <td style="padding: 10px; border: 1px solid black">${+n.toFixed(2)} руб</td>\n  </tr>\n  `, t)
}
export default {
  //получение сделок по фильтру
  getDealsAPI({ commit }, { filter = {}, select = {}, order = {} }) {
    return new Promise(resolve => {
      getDeals(filter, commit, resolve);
    });

    // return request("crm.deal.list", {
    //   filter,
    //   select,
    //   order,
    //   start: -1
    // }).then(deals => {
    //   if (deals.length > 0) {
    //     commit("addDeals", deals);
    //   }
    //   return deals;
    // });
  },

  //получение товарных позиций по сделкам
  getProductrowsAPI({ commit, state }, owners_id) {
    return request("crm.productrow.list", {
      filter: {
        OWNER_TYPE: "D",
        OWNER_ID: owners_id
      },
      start: -1
    }).then(productrows => {
      commit("addProductrows", productrows);
      return productrows;
    });
  },

  //обновление товарных позиций
  updateProductrowsAPI({ commit, state , dispatch, rootState}, deal_id) {
    let productrows = state.productrows.filter(
      productrow => productrow.OWNER_ID == deal_id
    );
    if (productrows.length == 0) {
      productrows = [{ id: null }];
    }
    return request("crm.deal.productrows.set", {
      id: deal_id,
      rows: productrows
    }).then(()=>{

      if(rootState.settings.settings.infoToComments && productrows.length != 0){
        dispatch('updateDeal',{deal_id:deal_id,productrows:productrows});

      }else{

      }
    });
  },
  updateDeal({commit, state},arParams){
    // console.log(productrows);
    // console.log(deal_id);
    
    let text = x(arParams.productrows);
    request('crm.deal.get',{ID:arParams.deal_id}).then(deal=>{
      let comments = deal.COMMENTS;
      comments = comments.split('<hr>')[1]
      if(comments == undefined){
        comments = deal.COMMENTS
      }
      console.log({COMMENTS:comments,TEXT:text});
      if(comments.length == 0){
        
        text = text + '<br><br><br>';
      }
      console.log({COMMENTS:comments});
      console.log({COMMENTS:comments,TEXT:text});

      text = text + comments;
      request('crm.deal.update',{ID:arParams.deal_id,fields:{COMMENTS:text}});
    })
  }
};

let deals = [];
let start = 0;
function getDeals(filter, commit, resolve) {
  let fields = {};
  for (let i = 0; i < 50; i++) {
    fields[i] = [
      "crm.deal.list",
      {
        filter: filter,
        order: { ID: "ASC" },
        // select: ['ID', 'TITLE'],
        start: i * 50 + start
      }
    ];
  }
  batchRequest(fields).then(res => {
    for (let i = 0; i < 50; i++) {
      let arr = res[i].data();
      if (arr.length == 0) return resolve();
      for (let i = 0; i < arr.length; i++) {
        if (deals[0] && arr[i]["ID"] == deals[0]["ID"]) {
          commit("addDeals", deals);
          return resolve();
        }
        deals.push(arr[i]);
      }
    }
    start += deals.length;
    getDeals(filter, commit, resolve);
  });
}