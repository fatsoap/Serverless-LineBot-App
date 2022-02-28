require('dotenv').config();
const tableName = process.env.SAMPLE_TABLE || 'SampleTable';

const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { getCurrentTimeString } = require('../utils/utils.js');

const docClient = new dynamodb.DocumentClient(
  process.env.STAGE === 'PROD'
    ? {}
    : {
        region: 'ap-northeast-1',
        endpoint: process.env.AWS_SAM_LOCAL
          ? new AWS.Endpoint('http://dynamodb:8000')
          : new AWS.Endpoint('http://127.0.0.1:8000'),
      }
);

exports.orderProductsHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(
      `orderProducts only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  const response = await orderProducts(JSON.parse(event.body));

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};

async function orderProducts(items) {
  let getProductsParams = {
    TableName: tableName,
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
        Number(products.items[index].total) <
        Number(products.items[index].purchased) + Number(item.amount)
      ) {
        throw 'product amount not enough';
      }
      products.items[index].purchased =
        Number(products.items[index].purchased) + Number(item.amount);
    });
  } catch (err) {
    console.info(JSON.stringify(err));
    return {
      statusCode: 400,
      body: err.message,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  let PutProductsParams = {
    TableName: tableName,
    Item: products,
  };
  await docClient.put(PutProductsParams).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ products: products, items: items }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
}
