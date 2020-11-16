var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var table = "userPI";

exports.handler = async event => {
    
    var uuid = event.uuid;
    var metadata = event.metadata;
    metadata = metadata.replace("[", "");
    metadata = metadata.replace("]", "");
    metadata = metadata.split(",");
    let _result = "";
    
    var getParams = {
      TableName: table,
      Key: {
        'uuid': {
          S: uuid
        }
      },
      ProjectionExpression: 'metadata'
    };
    
    function isEmptyObject(obj) {
      return !Object.keys(obj).length;
    }
    
    
    console.log("Get the item...");
    var result = await ddb.getItem(getParams).promise()
    console.log(JSON.stringify(result));
    var antw = result.Item;
    
    if (isEmptyObject(antw)){
        var params1 = {
            TableName:table,
            Key:{
                "uuid": uuid
            },
            UpdateExpression: "set metadata = :newdata",
            ExpressionAttributeValues: {
                ":newdata": metadata
            },
        };
        
        try {
            console.log("Updating the item...");
            _result = await docClient.update(params1).promise();
            const response = {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Origin" : "*" // Required for CORS
              },
            };
            return response;
        } catch (e) {
            return {
              statusCode: 500,
              body: {e}
            };
        }
    }else{
        var params = {
            TableName:table,
            Key:{
                "uuid": uuid
            },
            UpdateExpression: "set metadata = list_append(metadata, :newdata)",
            ExpressionAttributeValues: {
                ":newdata": metadata
            },
        };
        
        try {
            console.log("Updating the item...");
            _result = await docClient.update(params).promise();
            const response = {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Origin" : "*" // Required for CORS
              },
            };
            return response;
        } catch (e) {
            return {
              statusCode: 500,
              body: {metadata}
            };
        }
    }
    
    
};