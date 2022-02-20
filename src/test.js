const { getCurrentTimeString } = require('./utils/utils');
const { getProductsHandler } = require('./handlers/get_products');
getProductsHandler({
  httpMethod: 'GET',
  pathParameters: {
    date: 2022 - 2 - 21,
  },
  path: '/apis/product/2022-2-21',
});

const { putProductsHandler } = require('./handlers/put_products');
putProductsHandler({
  httpMethod: 'PUT',
  path: '/apis/product/',
  body: {
    date: getCurrentTimeString(),
    id: 'Products',
    items: [
      { name: '蘋果', total: 10, purchased: 0 },
      { name: '香蕉', total: 3, purchased: 0 },
      { name: '芭樂', total: 15, purchased: 0 },
      { name: '葡萄', total: 7, purchased: 0 },
    ],
  },
});
