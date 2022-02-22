const tableName = process.env.SAMPLE_TABLE;
const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient(
  process.env.PROD
    ? {}
    : {
        region: 'ap-northeast-1',
        endpoint: new AWS.Endpoint('http://127.0.0.1:8000'),
      }
);

/** YYYY-MM-DD */
function getCurrentTimeString() {
  let d = new Date();
  d.setUTCHours(d.getUTCHours() + 8);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`; // -${d.getUTCHours()}-${d.getUTCMinutes()}`;
}

async function orderProducts() {
  let items = [
    { name: '蘋果', amount: 4 },
    { name: '香蕉', amount: 2 },
    { name: '葡萄', amount: 4 },
  ];

  let getProductsParams = {
    TableName: 'SimpleTable',
    Key: { date: getCurrentTimeString(), id: process.env.PRODUCTS },
  };
  let { Item: products } = await docClient.get(getProductsParams).promise();
  try {
    items.forEach((item) => {
      let index = products.items.findIndex((p) => p.name === item.name);
      if (index === -1) {
        throw 'product not exist error';
      }
      if (
        products.items[index].total <
        products.items[index].purchased + item.amount
      ) {
        throw 'product amount not enough';
      }
      products.items[index].purchased += item.amount;
    });
  } catch (err) {
    console.log(err);
    return;
  }

  let PutProductsParams = {
    TableName: 'SimpleTable',
    Item: products,
  };
  await docClient.put(PutProductsParams).promise();
  console.log(products);
}

orderProducts();
