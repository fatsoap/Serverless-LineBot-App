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

exports.getProductsHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getProducts only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  // TODO path params -> date
  const date = event.pathParameters.date;

  let params = {
    TableName: 'SimpleTable',
    Key: { date: date, id: 'Products' },
  };
  let { Item: data } = await docClient.get(params).promise();

  const response = {
    statusCode: 200,
    body: JSON.stringify(data),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
