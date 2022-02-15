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

exports.putItemHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);
  console.log(body);

  // var params = {
  //   TableName: tableName,
  //   Item: { id: id, name: name },
  // };
  // let data;
  // try {
  //   await docClient.put(params).promise();
  // } catch (err) {
  //   body = 'error';
  // }

  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
