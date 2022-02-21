const API_HOST =
  'https://1c8e-111-251-91-141.ngrok.io' || 'http://127.0.0.1:3000';
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

async function purchase() {
  await liff.ready;
  if (!(await liff.isInClient()) || !(await liff.isLoggedIn())) {
    return notInLiff();
  }
  try {
    let res = await fetch(API_HOST + '/api/order/', {
      method: 'POST',
      body: JSON.stringify(cart),
    });
  } catch (err) {
    // TODO: handle err
    return;
  }
  let { products, items } = await res.json();
  /** Send Message */
  await liff.sendMessages([
    {
      type: 'text',
      text: `${products.date} 訂購\n${items
        .map((item) => `${item.name}:${item.amount}`)
        .join('\n')}`,
    },
  ]);
  /** Close Window after success purchase */
  liff.closeWindow();
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
    return notInLiff();
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
  console.log('Not in LIFF or Not Logged In');
  liff.closeWindow();
}
