1. Run Docker Container

[Docker Hub](https://hub.docker.com/r/amazon/dynamodb-local)

```javascript
// 預設
docker run -p 8000:8000 amazon/dynamodb-local
// 共用資料庫
docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb
```

預設 docker run container 會執行 `-jar DynamoDBLocal.jar` ，此時的資料庫會依照用戶 access-key-id + region 來區分不同用戶和不同區域的 tables，在有多個用戶 or Region 的時候有機會在創建 table 後發現找不到(因為創建和查詢的用戶 id 或是 region 不一樣)。 `-sharedDb` 是叫 dynamoDB 所有用戶 & Region 一起 share table 的 flag，所以在 run container 指令後面加上 `-jar DynamoDBLocal.jar -sharedDb` 來取代預設的指令。

2. Test Command with AWS CLI

> endpoint url is required otherwise it will connected to cloud dynamoDB

```
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

3. Build Table with AWS CLI builder

   [AWS CLI Builder](https://awsclibuilder.com/home)

```
aws dynamodb create-table --attribute-definitions AttributeName=id,AttributeType=S --table-name SimpleTable --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2 --region ap-southeast-2 --output json
```

建一個名叫 SimpleTable 的 table

4. 檢查有無成功

```
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

5. 開始開發

測試階段時更改 dynamoDB 的 endpoint url

```javascript
if (!process.env.PROD) {
  AWS.config.update({
    region: 'ap-northeast-1',
    endpoint: 'http://localhost:8000',
  });
  console.log('++++++++++++++++++++++++++++++++++++++++++');
}
```

[How to use AWS Dynamo DB Local](https://www.youtube.com/watch?v=z77UbwWf1po)

[getting-started-nodejs](https://docs.aws.amazon.com/zh_tw/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.04.html)

[AWS DynamoDB Local Usage Notes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html)
