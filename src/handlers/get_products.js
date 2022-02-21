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

exports.getProductsHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getProducts only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  const date = event.pathParameters
    ? event.pathParameters.date
    : getCurrentTimeString();

  let params = {
    TableName: tableName,
    Key: { date: date, id: 'Products' },
  };
  try {
    let { Item: data } = await docClient.get(params).promise();

    if (!data) {
      data = {
        id: 'Products',
        date: date,
        items: [],
      };
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(data),
    };

    // All log statements are written to CloudWatch
    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
