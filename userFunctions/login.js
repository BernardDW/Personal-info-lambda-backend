const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async event => {
  const params = {
    TableName: "userPI"
  };
  try {
    // Utilising the scan method to get all items in the table
    const data = await documentClient.scan(params).promise();
    let usernames = [];
    let userUUID = [];
    let passwords = [];
    
    for(let i = 0; i < data.Items.length; i++) {
      usernames.push(data.Items[i].username);
      userUUID.push(data.Items[i].uuid);
      passwords.push(data.Items[i].password);
    }
    
    if(usernames.includes(event.user)) {
      if(passwords[usernames.indexOf(event.user)] === event.pass) {
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Origin" : "*" // Required for CORS
        },
        body: userUUID[usernames.indexOf(event.user)]
      };
      return response
      }else{
        return {
          statusCode: 500,
          headers: {
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin" : "*" // Required for CORS
          },
          body: "Password incorrect"
        };
      }
    }else{
      const response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Origin" : "*" // Required for CORS
        },
        body: "Username does not exist"
      };
      return response
    }
    
  } catch (e) {
    return {
      statusCode: 500
    };
  }
};