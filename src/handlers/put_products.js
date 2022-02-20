const tableName = process.env.SAMPLE_TABLE || 'SampleTable';

const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { getCurrentTimeString } = require('../utils/utils');

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

async function putProducts(data) {
  let params = {
    TableName: tableName,
    Item: JSON.parse(data),
  };
  await docClient.put(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(JSON.parse(data)),
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
