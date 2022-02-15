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

async function readProducts(date = getCurrentTimeString()) {
  var params = {
    TableName: 'SimpleTable',
    Key: { date: date, id: 'Products' },
  };
  let { Item: data } = await docClient.get(params).promise();
  console.log(data);
}

readProducts();

exports.getAllItemsHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  var params = {
    TableName: tableName,
  };
  let data;
  try {
    data = await docClient.scan(params).promise();
  } catch (err) {
    data = { Item: JSON.stringify(err) };
  }
  const items = data.Item;

  const response = {
    statusCode: 200,
    body: JSON.stringify(items),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
