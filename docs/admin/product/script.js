const API_HOST =
  'https://2ann2yvt6e.execute-api.ap-northeast-1.amazonaws.com/Prod';

let product_amount = 0;
let products = undefined;
let fetching = false;

window.onload = async function () {
  await init();
};

async function init() {
  try {
    /** get Today's Products */
    let res = await fetch(API_HOST + '/api/product/', {
      method: 'GET',
    });
    let data = await res.json();
    document.getElementById(
      'admin-products-title'
    ).innerText = `編輯 ${data.date} 訂購商品`;
    products = { ...data };
    initProdcuts(data.items);
  } catch (err) {}
}

async function initProdcuts(items) {
  let products_container = document.getElementById('admin-products');
  items.forEach((item, index) => {
    let newPro = document.createElement('div');
    newPro.id = `admin-products-${index}`;
    let text = `
      <main class="admin-product-main">
        <div>
            <label>名稱</label>
            <input value="${item.name}" />
        </div>
        <div>
            <label>總量</label>
            <input value="${item.total}" />
        </div>
        <div>
            <label>已購買量</label>
            <input value="${item.purchased}" />
        </div>
        <div>
            <label>價格</label>
            <input value="${item.price}" />
        </div>
      </main>
        <button onclick="deleteProduct(${index})">刪除商品</button>
      `;
    newPro.innerHTML = text;
    products_container.appendChild(newPro);
  });
  product_amount = items.length;
}

function createNewProduct() {
  let products_container = document.getElementById('admin-products');
  let newPro = document.createElement('div');
  let index = ++product_amount;
  newPro.id = `admin-products-${index}`;
  let text = `
      <main class="admin-product-main">
      <div>
        <label>名稱</label>
        <input value="" />
        </div>
        <div>
            <label>總量</label>
            <input value="0" />
        </div>
        <div>
            <label>已購買量</label>
            <input value="0" />
        </div>
        <div>
            <label>價格</label>
            <input value="0" />
        </div>
      </main>
        <button onclick="deleteProduct(${index})">刪除商品</button>
      `;
  newPro.innerHTML = text;
  products_container.appendChild(newPro);
}

function deleteProduct(index) {
  let delPro = document.getElementById(`admin-products-${index}`);
  delPro.remove();
}

async function updateProducts() {
  if (fetching) return;
  try {
    fetching = true;
    document.getElementById(
      'admin-products-button-update'
    ).style.backgroundColor = '#ff0000';
    handlerError('更新中');
    let newItems = [];
    let ele = document.getElementById('admin-products');
    for (let index = 0; index < ele.children.length; index++) {
      let [
        {
          children: { 1: name },
        },
        {
          children: { 1: total },
        },
        {
          children: { 1: purchased },
        },
        {
          children: { 1: price },
        },
      ] = ele.children[index].children[0].children;
      if (name.value === '') {
        return handlerError('名稱不可空白');
      }
      if (
        total.value === '' ||
        isNaN(Number(total.value)) ||
        Number(total.value) < 0
      ) {
        return handlerError(`商品名稱"${name.value}"的"總量"必須是數字`);
      }
      if (
        purchased.value === '' ||
        isNaN(Number(purchased.value)) ||
        Number(purchased.value) < 0
      ) {
        return handlerError(`商品名稱"${name.value}"的"已購買量"必須是數字`);
      }
      if (
        price.value === '' ||
        isNaN(Number(price.value)) ||
        Number(price.value) < 0
      ) {
        return handlerError(`商品名稱"${name.value}"的"價格"必須是數字`);
      }
      newItems.push({
        name: name.value,
        total: Number(total.value),
        purchased: Number(purchased.value),
        price: Number(price.value),
      });
    }
    /** post Today's Products */
    let res = await fetch(API_HOST + '/api/product/', {
      method: 'POST',
      body: JSON.stringify({ ...products, items: newItems }),
    });
    handlerError('更新成功');
    fetching = false;
    document.getElementById(
      'admin-products-button-update'
    ).style.backgroundColor = '#04aa6d';
  } catch (err) {
    handlerError(err.message);
    fetching = false;
    document.getElementById(
      'admin-products-button-update'
    ).style.backgroundColor = '#04aa6d';
  }
}

function handlerError(msg) {
  //throw msg;
  let err = document.getElementById('admin-products-error');
  err.innerText = msg;
}
