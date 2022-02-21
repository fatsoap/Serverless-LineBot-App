const API_HOST =
  'https://1c8e-111-251-91-141.ngrok.io ' || 'http://127.0.0.1:3000';
let cart = [];

window.onload = async function () {
  let h3 = document.getElementById('profile');

  if (!(await liff.isInClient())) {
    return notInLiff();
  }

  try {
    await liff.init({ liffId: '1656880401-K2W55Dq1' });
    await initApp();
  } catch (err) {
    liff.closeWindow();
  }
};

function createProductElement(product, index) {
  let newPro = document.createElement('li');
  let text = `
      <main class="shopcart-product-main">
      <div>
        <h1>${product.name}</h1>
        <h2>(剩餘${product.total - product.purchased})</h2>
      </div>
      <div>
      <h3>${'' /*product.description*/}<h3>
      </div>
      <div>
      <h1>$ ${product.price}</h1>
      </div>
      </main>
      <footer class="shopcart-product-footer">
      <button onclick="updateAmount(${index}, -1)">-</button>
      <div><h1>0</h1></div>
      <button onclick="updateAmount(${index}, 1)">+</button>
      </footer>
  `;
  newPro.innerHTML = text;
  let ul = document.getElementById('shopcart-products');
  ul.appendChild(newPro);
  cart.push({ amount: 0, ...product });
}

function purchase() {
  let rt = document.getElementById('root');
  rt.innerText = JSON.stringify(cart);
}

function updateAmount(index, amount) {
  if (cart[index].amount + amount < 0) return;
  cart[index].amount += amount;
  let products = document.querySelectorAll('li');
  products[index].children[1].children[1].children[0].innerText =
    cart[index].amount;
  // calculate totla price
  let total_field = document.getElementById('shopcart-totalprice');
  let total_price = 0;
  cart.forEach((pro) => (total_price += pro.amount * pro.price));
  total_field.innerText = '$ ' + total_price;
}

async function initApp() {
  if (!(await liff.isLoggedIn())) {
    return notLoggedIn();
  }
  try {
    let profile = await liff.getProfile();
    /** get Today's Products */
    let res = await fetch(API_HOST + '/api/product/', {
      method: 'GET',
    });
    let data = await res.json();
    document.getElementById(
      'shopcart-titledate'
    ).innerText = `${data.date} 訂購 (請於晚上六點前下單)`;
    cart = [];
    data.items.forEach((element, index) => {
      createProductElement(element, index);
    });
  } catch (err) {}
}

async function notInLiff() {
  console.log('Not in LIFF');
  liff.closeWindow();
}

async function notLoggedIn() {
  console.log('Not Logged In');
  liff.closeWindow();
}
