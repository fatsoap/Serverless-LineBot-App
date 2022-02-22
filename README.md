1. Run Docker Container

[Docker Hub](https://hub.docker.com/r/amazon/dynamodb-local)

```javascript
// 預設
docker run -p 8000:8000 amazon/dynamodb-local
// 共用網路 + 共用資料庫 + 命名為 dynamodb
docker network create lambda-local
docker run -p 8000:8000 --network lambda-local --name dynamodb amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb
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
aws dynamodb create-table --attribute-definitions AttributeName=date,AttributeType=S AttributeName=id,AttributeType=S --table-name SampleTable --key-schema AttributeName=date,KeyType=HASH AttributeName=id,KeyType=RANGE --provisioned-throughput ReadCapacityUnits=2,WriteCapacityUnits=2 --region ap-northeast-1 --output json --endpoint-url http://localhost:8000
```

建一個名叫 SimpleTable 的 table

4. 檢查有無成功

```
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

5. 開始開發

測試階段時更改 dynamoDB 的 endpoint url

```javascript
const docClient = new dynamodb.DocumentClient(
  process.env.PROD
    ? {}
    : {
        region: 'ap-northeast-1',
        endpoint: process.env.AWS_SAM_LOCAL
          ? new AWS.Endpoint('http://dynamodb:8000')
          : new AWS.Endpoint('http://127.0.0.1:8000'),
      }
);
```

[How to use AWS Dynamo DB Local](https://www.youtube.com/watch?v=z77UbwWf1po)

[getting-started-nodejs](https://docs.aws.amazon.com/zh_tw/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.04.html)

[AWS DynamoDB Local Usage Notes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html)

```
// 讓 SAM 的 docker 執行時是在和 dynamoDB 同一個 docker net : lambda-local
sam local start-api  --docker-network lambda-local
```

6. Deploy

```
sam deploy --guided
```
