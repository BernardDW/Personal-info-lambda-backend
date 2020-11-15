
const S3 = require('aws-sdk/clients/s3');
const s3 = new S3();

exports.handler = async (event) => {
    // TODO implement
    const result = await getUploadURL();
    console.log("Result: ", result);
    return result;
};

const getUploadURL = async function() {
    
    const params = {
        Bucket: process.env.s3Bucket,
        Key: "temp.xlsx",
        ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ACL: 'public-read'
    }
    
    console.log('getUploadURL: ', params);
    return new Promise((resolve, reject) => {
        resolve({
            "statusCode": 200,
            "isBase64Encoded": false,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": JSON.stringify({
                "uploadURL": s3.getSignedUrl("putObject",params)
            })
        })
    })
}