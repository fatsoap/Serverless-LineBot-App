// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

// Create a DocumentClient that represents the query to add an item
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

var params = {
  TableName: 'SimpleTable',
};
let data;
docClient
  .scan(params)
  .promise()
  .then((data) => console.log(data));

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.getAllItemsHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
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
