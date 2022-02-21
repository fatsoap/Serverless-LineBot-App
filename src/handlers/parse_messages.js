const tableName = process.env.SAMPLE_TABLE || 'SampleTable';

const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { getCurrentTimeString } = require('../utils/utils.js');

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

// TODO: update group ID
const group_id = process.env.GROUP_ID || 'C0aaadacda65271ee8760524e669d452c';

exports.parseMessagesHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(
      `parseMessages only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  const response = await handleMessageAPI(JSON.parse(event.body));

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};

async function handleMessageAPI(message) {
  if (message.events.length === 0) {
    return {
      statusCode: 200,
      body: 'Empty Event Message',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
  if (message.events[0].source.groupId !== group_id) {
    return {
      statusCode: 200,
      body: 'Not in Group Message',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } else if (message.events[0].type === 'message') {
    let data = {};
    try {
      data = {
        date: getCurrentTimeString(),
        id: message.events[0].message.id,
        user_id: message.events[0].source.userId,
        items: parseOrderMessage(message.events[0].message.text),
        timestamp: message.events[0].timestamp,
        isDeleted: false,
      };
    } catch (err) {
      return {
        statusCode: 200,
        body: 'Not Purchase Message',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
    }
    let params = {
      TableName: tableName,
      Item: data,
    };
    await docClient.put(params).promise();
    return {
      statusCode: 200,
      body: 'Add New Order Success',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } else if (message.events[0].type === 'unsend') {
    let date = getCurrentTimeString();
    let get_params = {
      TableName: tableName,
      Key: { date: date, id: message.events[0].unsend.messageId },
    };
    let { Item: data } = await docClient.get(get_params).promise();
    if (data && !data.isDeleted) {
      data.isDeleted = true;
    }
    let put_params = {
      TableName: tableName,
      Item: data,
    };
    await docClient.put(put_params).promise();
    return {
      statusCode: 200,
      body: 'Cancel Order Success',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } else {
    return {
      statusCode: 200,
      body: 'Ignore Event Message',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}

function parseOrderMessage(text) {
  let rows = text.split('\n');

  let [date, action] = rows[0].split(' ');
  if (date !== getCurrentTimeString() || action !== '訂購') {
    throw 'Parse Failed';
  }
  let items = [];
  for (let i = 1; i < rows.length; i++) {
    let [name, amount] = rows[i].split(':');
    if (!name || !amount) {
      throw 'Parse Failed';
    }
    items.push({
      name,
      amount,
    });
  }
  return items;
}
