const API_HOST =
  "https://2ann2yvt6e.execute-api.ap-northeast-1.amazonaws.com/Prod";

let products = undefined;

window.onload = async function () {
  // await init();
};

async function init() {
  try {
    /** get Today's Orders */
    let res = await fetch(API_HOST + "/api/order/2022-2-22", {
      method: "GET",
    });
    let data = await res.json();
    document.getElementById(
      "admin-order-title"
    ).innerText = `${data[0].date} 訂購商品`;
    parsedData = parseData(data);
    console.log(parsedData, products);
    // initTable(data);
  } catch (err) {}
}

function parseData(datas) {
  let orders = {};
  datas.forEach((data, index) => {
    if (!data.user_id) {
      products = { ...data };
      return;
    }
    if (data.isDeleted) return;
    if (!orders[data.user_id]) {
      orders[data.user_id] = {
        user_id: data.user_id,
        items: {},
      };
    }
    data.items.forEach((item) => {
      if (!orders[data.user_id].items[item.name]) {
        orders[data.user_id].items[item.name] = Number(item.amount);
      } else {
        orders[data.user_id].items[item.name] += Number(item.amount);
      }
    });
  });
  return orders;
}

async function initTable(orders) {
  let table_body = document.getElementById("admin-orders-table-body");
  let text = "";
  orders.forEach((order, index) => {
    if (!order.user_id || order.isDeleted) return;
    text += "<tr>";
    text += `<td>${order.user_id}</td>`;

    order.items.forEach((item) => {
      text += `<td>${item.name} : ${item.amount}</td>`;
    });

    text += "</tr>";
  });
  table_body.innerHTML = text;
}

function handlerError(msg) {
  //throw msg;
  let err = document.getElementById("admin-products-error");
  err.innerText = msg;
}
