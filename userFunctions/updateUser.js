var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient()

var table = "userPI";

exports.handler = async event => {
    
    var uuid = event.uuid;
    var metadata = event.metadata;
    metadata = metadata.replace("[", "");
    console.log(metadata)
    metadata = metadata.replace("]", "");
    console.log(metadata)
    metadata = metadata.split(",");
    console.log(metadata)
    let _result = "";

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
};