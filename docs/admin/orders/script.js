const API_HOST =
  'https://2ann2yvt6e.execute-api.ap-northeast-1.amazonaws.com/Prod';

let products = undefined;

window.onload = async function () {
  await init();
};

async function init() {
  try {
    /** get Today's Orders */
    let res = await fetch(API_HOST + '/api/order/', {
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
  let table = document.getElementById('admin-orders-table');
  let head_text = '<tr>';
  head_text += `<th>用戶</th>`;
  products.items.forEach((item) => {
    head_text += `<th>${item.name}</th>`;
  });
  head_text += '</tr>';
  let body_text = '';
  if (!products) return;
  let purchased = Array(products.items.length).fill(0);
  Object.keys(orders).forEach((key) => {
    order = orders[key];
    body_text += '<tr>';
    body_text += `<td>${order.name}</td>`; // <img src="${order.avatar}" />
    products.items.forEach((item, index) => {
      let amount = 0;
      if (order.items[item.name]) {
        amount = order.items[item.name];
      }
      purchased[index] += amount;
      body_text += `<td>${amount}</td>`;
    });
    body_text += '</tr>';
  });
  body_text += '<tr><td>總和</td>';
  purchased.forEach((nm) => {
    body_text += `<td>${nm}</td>`;
  });
  body_text += '</tr>';
  table.innerHTML = head_text + body_text;
}

function handlerError(msg) {
  //throw msg;
  let err = document.getElementById('admin-products-error');
  err.innerText = msg;
}
