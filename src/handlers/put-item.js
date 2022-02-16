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

/** YYYY-MM-DD */
function getCurrentTimeString() {
  let d = new Date();
  d.setUTCHours(d.getUTCHours() + 8);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`; // -${d.getUTCHours()}-${d.getUTCMinutes()}`;
}

const group_id = process.env.GROUP_ID || 'C0aaadacda65271ee8760524e669d452c';

exports.putItemHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  const response = handleMessageAPI(event.body);

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};

function handleMessageAPI(body) {
  // Get id and name from the body of the request
  const message = JSON.parse(body);

  if (message.events.length === 0) {
    return {
      statusCode: 200,
      body: 'Empty Event Message',
    };
  }
  if (message.events[0].source.groupId !== group_id) {
    return {
      statusCode: 200,
      body: 'Not in Group Message',
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
      };
    }
    let params = {
      TableName: 'SimpleTable',
      Item: data,
    };
    await docClient.put(params).promise();
    return {
      statusCode: 200,
      body: 'Add New Order Success',
    };
  } else if (message.events[0].type === 'unsend') {
    let date = getCurrentTimeString();
    let get_params = {
      TableName: 'SimpleTable',
      Key: { date: date, id: message.events[0].unsend.messageId },
    };
    let { Item: data } = await docClient.get(get_params).promise();
    if (data && !data.isDeleted) {
      data.isDeleted = true;
    }
    let put_params = {
      TableName: 'SimpleTable',
      Item: data,
    };
    await docClient.put(put_params).promise();
    return {
      statusCode: 200,
      body: 'Cancel Order Success',
    };
  } else {
    return {
      statusCode: 200,
      body: 'Ignore Event Message',
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
