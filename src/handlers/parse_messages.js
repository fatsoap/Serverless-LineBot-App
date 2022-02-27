require('dotenv').config();
const tableName = process.env.SAMPLE_TABLE || 'SampleTable';

const AWS = require('aws-sdk');
const dynamodb = require('aws-sdk/clients/dynamodb');
const { getCurrentTimeString } = require('../utils/utils.js');
const line = require('@line/bot-sdk');

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

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
  for (let i = 0; i < message.events.length; i++) {
    if (message.events[i].source?.groupId !== group_id) {
      console.info('Not in Group Message');
    } else if (message.events[i].type === 'memberJoined') {
      for (let j = 0; j < message.events[i].joined.members.length; j++) {
        try {
          member = message.events[i].joined.members[j];
          data = {
            date: process.env.MEMBERS,
            id: member.userId,
            user_id: member.userId,
            timestamp: message.events[i].timestamp,
          };
          let profile = await client.getGroupMemberProfile(
            group_id,
            data.user_id
          );
          data.display_name = profile.displayName;
          data.picture_url = profile.pictureUrl;
          data.status_message = profile.statusMessage;

          let params = {
            TableName: tableName,
            Item: data,
          };
          await docClient.put(params).promise();
          console.info(
            `Add Joined Member Success ${message.events[i].joined.members[j].userId}`
          );
        } catch (err) {
          console.info(
            `Add Joined Member Failed ${message.events[i].joined.members[j].userId}`
          );
        }
      }
    } else if (message.events[i].type === 'message') {
      try {
        let data = {
          date: getCurrentTimeString(),
          id: message.events[i].message.id,
          user_id: message.events[i].source.userId,
          items: parseOrderMessage(message.events[i].message.text),
          timestamp: message.events[i].timestamp,
          isDeleted: false,
        };
        let params = {
          TableName: tableName,
          Item: data,
        };
        await docClient.put(params).promise();
        console.info(`Add New Order Success ${message.events[i].message.id}`);
      } catch (err) {
        console.info(`Not Purchase Message ${message.events[i].message.id}`);
      }
    } else if (message.events[i].type === 'unsend') {
      try {
        let date = getCurrentTimeString();
        let get_params = {
          TableName: tableName,
          Key: { date: date, id: message.events[i].unsend.messageId },
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
        console.info(
          `Cancel Order Success ${message.events[i].unsend.messageId}`
        );
      } catch (err) {
        console.info(
          `Cancel Order Failed ${message.events[i].unsend.messageId}`
        );
      }
    } else {
      console.info('Ignore Event Message');
    }
  }
  return {
    statusCode: 200,
    body: 'Handle Message Done',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
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
