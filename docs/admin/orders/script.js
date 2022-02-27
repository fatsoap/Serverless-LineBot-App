const API_HOST =
  'https://2ann2yvt6e.execute-api.ap-northeast-1.amazonaws.com/Prod';

let products = undefined;

window.onload = async function () {
  //await init();
};

async function init() {
  try {
    /** get Today's Orders */
    let res = await fetch(API_HOST + '/api/order/2022-2-22', {
      method: 'GET',
    });
    let { order, user } = await res.json();
    document.getElementById(
      'admin-order-title'
    ).innerText = `${order[0].date} 訂購商品`;
    parsedData = parseData(order, user);
    // console.log(parsedData, products);
    initTable(parsedData);
  } catch (err) {}
}

function parseData(orders, users) {
  let result = {};
  products = undefined;
  orders.forEach((order, index) => {
    if (!order.user_id) {
      products = { ...order };
      return;
    }
    if (order.isDeleted) return;
    if (!result[order.user_id]) {
      let { display_name, picture_url } = users.find(
        (user) => user.user_id === order.user_id
      );
      result[order.user_id] = {
        user_id: order.user_id,
        items: {},
        name: display_name || 'unknown name',
        avatar: picture_url || '',
      };
    }
    order.items.forEach((item) => {
      if (!result[order.user_id].items[item.name]) {
        result[order.user_id].items[item.name] = Number(item.amount);
      } else {
        result[order.user_id].items[item.name] += Number(item.amount);
      }
    });
  });
  return result;
}

async function initTable(orders) {
  let table_body = document.getElementById('admin-orders-table-body');
  let table_head = document.getElementById('admin-orders-table-head');
  let head_text = '<tr>';
  head_text += `<th>用戶</th>`;
  products.items.forEach((item) => {
    head_text += `<th>${item.name}</th>`;
  });
  head_text += '</tr>';
  table_head.innerHTML = head_text;
  let text = '';
  if (!products) return;
  Object.keys(orders).forEach((key, index) => {
    order = orders[key];
    text += '<tr>';
    text += `<td>${order.name}</td>`;
    products.items.forEach((item) => {
      let amount = 0;
      if (order.items[item.name]) {
        amount = order.items[item.name];
      }
      text += `<td>${amount}</td>`;
    });
    text += '</tr>';
  });
  table_body.innerHTML = text;
}

function handlerError(msg) {
  //throw msg;
  let err = document.getElementById('admin-products-error');
  err.innerText = msg;
}
