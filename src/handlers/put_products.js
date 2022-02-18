const tableName = process.env.SAMPLE_TABLE;

const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { getCurrentTimeString } = require('../utils/utils.js');

const docClient = new dynamodb.DocumentClient(
  process.env.PROD
    ? {}
    : {
        region: 'ap-northeast-1',
        endpoint: new AWS.Endpoint('http://127.0.0.1:8000'),
      }
);

async function putProducts(data) {
  // let data = {
  //   date: getCurrentTimeString(),
  //   id: 'Products',
  //   items: [
    //   { name: '蘋果', total: 10, purchased: 0 },
    //   { name: '香蕉', total: 3, purchased: 0 },
    //   { name: '芭樂', total: 15, purchased: 0 },
    //   { name: '葡萄', total: 7, purchased: 0 },
    // ],
  // };
  let params = {
    TableName: 'SimpleTable',
    Item: data,
  };
  await docClient.put(params).promise();
  return {
    statusCode: 200,
    body: data,
  };
}


exports.putProductsHandler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    throw new Error(
      `putProducts only accepts PUT method, you tried: ${event.httpMethod} method.`
    );
  }

  const response = await putProducts(event.body);

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};

    
