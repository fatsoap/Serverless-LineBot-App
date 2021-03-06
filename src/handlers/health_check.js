require('dotenv').config();
const stage = process.env.STAGE;

exports.healthCheckHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getProducts only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      data: `Health Check Pass , Stage : ${stage}`,
    }),
  };

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
