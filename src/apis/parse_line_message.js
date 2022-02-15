let msg1 = ` {"destination":"U359d7ecf416d4b002060bfe477302d10","events":[{"type":"message","message":{"type":"text","id":"15593641151274","text":"123"},"timestamp":1644920644198,"source":{"type":"group","groupId":"C0aaadacda65271ee8760524e669d452c","userId":"U4f0be79dd749f25077200bce2535af4e"},"replyToken":"2a5f416ac3d1475b847c7a2022c3a841","mode":"active"}]}`;
let msg2 = `{"destination":"U359d7ecf416d4b002060bfe477302d10","events":[{"type":"message","message":{"type":"text","id":"15593657508571","text":"a"},"timestamp":1644920840579,"source":{"type":"group","groupId":"C0aaadacda65271ee8760524e669d452c","userId":"U4f0be79dd749f25077200bce2535af4e"},"replyToken":"27e3c7291d35411d8a47a12e67cec602","mode":"active"}]}`;
let msg3 = `{"destination":"U359d7ecf416d4b002060bfe477302d10","events":[{"type":"unsend","unsend":{"messageId":"15593657508571"},"timestamp":1644920844204,"source":{"type":"group","groupId":"C0aaadacda65271ee8760524e669d452c","userId":"U4f0be79dd749f25077200bce2535af4e"},"mode":"active"}]}`;
let msg4 = `{"destination":"U359d7ecf416d4b002060bfe477302d10","events":[]}`;
let msg5 = `2022-2-15 訂購\n蘋果:7\n鳳梨:1\n葡萄:2`;

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

async function parseLineMessage() {
  let message = JSON.parse(msg2);
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
    console.log(data);
    return {
      statusCode: 200,
      body: 'Add New Order Success',
    };
  } else if (message.events[0].type === 'unsend') {
    let data = {
      date: getCurrentTimeString(),
      id: message.events[0].unsend.messageId,
    };
    console.log(data);
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
console.log(parseLineMessage());

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
