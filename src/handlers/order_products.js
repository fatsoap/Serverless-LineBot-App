const tableName = process.env.SAMPLE_TABLE || 'SampleTable';

const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { getCurrentTimeString } = require('../utils/utils.js');

const docClient = new dynamodb.DocumentClient(
  process.env.PROD
    ? {}
    : {
        region: 'ap-northeast-1',
        endpoint: process.env.AWS_SAM_LOCAL
          ? new AWS.Endpoint('http://dynamodb:8000')
          : new AWS.Endpoint('http://127.0.0.1:8000'),
      }
);

exports.orderProductsHandler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    throw new Error(
      `orderProducts only accepts PUT method, you tried: ${event.httpMethod} method.`
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
    Key: { date: getCurrentTimeString(), id: 'Products' },
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
    return {
      statusCode: 400,
      body: err.message,
    };
  }

  let PutProductsParams = {
    TableName: tableName,
    Item: products,
  };
  await docClient.put(PutProductsParams).promise();
  return {
    statusCode: 200,
    body: items,
  };
}
