require('dotenv').config();
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

exports.getOrdersHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getOrders only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  const date = event.pathParameters
    ? event.pathParameters.date
    : getCurrentTimeString();

  let params = {
    TableName: tableName,
    KeyConditionExpression: '#date = :date',
    ExpressionAttributeNames: {
      '#date': 'date',
    },
    ExpressionAttributeValues: {
      ':date': date,
    },
  };
  try {
    let data = await getOrderData(params);
    if (data.length === 0) {
      data = [
        {
          date: date,
          id: process.env.PRODUCTS,
          items: [],
        },
      ];
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };

    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};

async function getOrderData(params) {
  let {
    Items: data,
    Count: amount,
    LastEvaluatedKey: LastKey,
  } = await docClient.query(params).promise();
  console.log(amount, LastKey);
  if (LastKey) {
    params = { ...params, ExclusiveStartKey: params };
    return [...data, ...(await getOrderData(params))];
  }
  return [...data];
}
