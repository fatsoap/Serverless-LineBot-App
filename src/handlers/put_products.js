const tableName = process.env.SAMPLE_TABLE || 'SampleTable';

const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { getCurrentTimeString } = require('../utils/utils');

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

async function putProducts(data) {
  let params = {
    TableName: tableName,
    Item: data,
  };
  await docClient.put(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}

exports.putProductsHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(
      `putProducts only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  const response = await putProducts(JSON.parse(event.body));

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
