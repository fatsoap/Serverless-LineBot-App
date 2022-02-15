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

async function putProducts() {
  let data = {
    date: getCurrentTimeString(),
    id: 'Products',
    items: [
      { name: '蘋果', total: 10, purchased: 0 },
      { name: '香蕉', total: 3, purchased: 0 },
      { name: '芭樂', total: 15, purchased: 0 },
      { name: '葡萄', total: 7, purchased: 0 },
    ],
  };
  let params = {
    TableName: 'SimpleTable',
    Item: data,
  };
  await docClient.put(params).promise();
  console.log(data);
}
putProducts();
