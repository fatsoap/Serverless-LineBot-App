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

exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ data: 'Health Check Pass' }),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
