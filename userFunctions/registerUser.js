const AWS = require("aws-sdk");
const crypto = require("crypto");

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

// Initialising the DynamoDB SDK
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const params2 = {
    TableName: "userPI"
  };
  try {
    const data = await documentClient.scan(params2).promise();
    let usernames = [];
    
    for(let i = 0; i < data.Items.length; i++) {
      usernames.push(data.Items[i].username);
    }
    
     if(usernames.includes(event.username)) {
      const response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Origin" : "*" // Required for CORS
        },
        body: "This username is taken"
      };
      return response;
     }
  } catch (e) {
    return {
      statusCode: 500
    };
  };
  
  console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  const username = event.username;
  const password = event.password;
  const params = {
    TableName: "userPI",
    Item: { // Creating an Item with a unique id and with the passed title
      "uuid": generateUUID(),
      "username": username,
      "password": password
    }
  };
  
  console.log("Adding a new item...");
  
  try {
    // Utilising the put method to insert an item into the table (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html#GettingStarted.NodeJs.03.01)
    const data = await documentClient.put(params).promise();
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin" : "*" // Required for CORS
      },
    };
    return response; // Returning a 200 if the item has been inserted 
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin" : "*" // Required for CORS
      },
      body: JSON.stringify(e)
    };
  }
};