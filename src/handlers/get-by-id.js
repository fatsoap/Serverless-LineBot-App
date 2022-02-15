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

var params = {
  TableName: 'SimpleTable',
  Key: { id: '123' },
};
let data;
docClient
  .get(params)
  .promise()
  .then((data) => console.log(data));

exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;

  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  var params = {
    TableName: tableName,
    Key: { id: id },
  };
  let data;
  try {
    data = await docClient.get(params).promise();
  } catch (err) {
    data = { Item: 'error' };
  }
  const item = data.Item;

  const response = {
    statusCode: 200,
    body: JSON.stringify(item),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
