const tableName = process.env.SAMPLE_TABLE;


exports.healthCheckHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(
      `getProducts only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ data: 'Health Check Pass' }),
  };

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
