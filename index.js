console.log('Loading the file');

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    if (event.fileExt === undefined) {
        return("400 Invalid Input");
    }

    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "X-Requested-With": "*"
    };

    let extractedData = "";
    // Identifying a name is quite tricky, thus have I decided to add it regardless, because which company does not have the name and surname of a customer
    let metaList = ["Name and Surname"];
    const S3 = require('aws-sdk/clients/s3');
    const s3 = new S3();
    let lang = ["afrikaans","zulu","tswana","venda","xhosa","southern sotho","northern sotho","tsonga","swati","ndebele"];

    
    function validateData(str) 
    {   
        //Test for email
        var email = /\S+@\S+\.\S+/;
        if (email.test(str)){metaList.push("Email")}

        //Test for ID number
        var id = /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/;
        if (id.test(str)){metaList.push("ID")}

        //Test for cell number: xxx xxx xxxx OR xxxxxxxxxx
        var cell = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
        if (cell.test(str)){metaList.push("Cellphone number")}

        //Test for gender
        if(str.includes("male")){metaList.push("Gender")}
        else if(str.includes("female")){metaList.push("Gender")}

        //Test for race
        if(str.includes("brown")){metaList.push("Race")}
        else if(str.includes("white")){metaList.push("Race")}
        else if(str.includes("black")){metaList.push("Race")}
        else if(str.includes("coloured")){metaList.push("Race")}
        else if(str.includes("indian")){metaList.push("Race")}

        //Marital status
        if(str.includes("single")){metaList.push("Marital status")}
        else if(str.includes("married")){metaList.push("Marital status")}
        else if(str.includes("divorced")){metaList.push("Marital status")}

        //Language
        if(lang.filter(n=>str.includes(n)) != ""){metaList.push("Language")}
    }
    


    switch(event.fileExt)
    {
        case "plain":
        case "txt":
            // Extract text
            const params = {Bucket: 'filestation', Key: 'temp.txt'};
            
            try {
                await s3.getObject(params, function(err, data) {
                  if (err) console.log(err, err.stack); // an error occurred
                  else{           // successful response
                    extractedData = data.Body.toString('utf-8');
                    validateData(extractedData.toLowerCase());
                    context.done(null, metaList);
                  }
                }).promise();
        
            } catch (error) {
                console.log(error);
                return;
            }  
           
            break;
        case "xlsx":
            // Extract text
            
            const params2 = {Bucket: 'filestation', Key: 'temp.xlsx'};
            
            const xlsx = require('xlsx');

            return new Promise((resolve,reject) => {
                var file = s3.getObject(params2).createReadStream();
                var buffers = [];
                
        
                file.on('data', function (data) {
                    buffers.push(data);
                });
            
                file.on('end', function () {
                    var buffer = Buffer.concat(buffers);
                    var workbook = xlsx.read(buffer);
                    var sheet_name_list = workbook.SheetNames;
                    var xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
                    let str = JSON.stringify(xlData);
                    str = str.replace(/\:|\,/g," ");
                    str = str.replace(/\{|\}|\"|EMPTY|\_/g,"");
                    console.log(str)
                    validateData(str.toLowerCase());
                    console.log(metaList);
                    resolve(metaList);
                });
                file.on('error', e => {
                    reject(e);
                });
            }); 

        case "json":
            const params3 = {Bucket: 'filestation', Key: 'temp.json'};
            
            try {
                await s3.getObject(params3, function(err, data) {
                  if (err) console.log(err, err.stack); // an error occurred
                  else{           // successful response
                    extractedData = data.Body.toString('utf-8');
                    console.log(extractedData);
                    validateData(extractedData.toLowerCase());
                    context.done(null, metaList);
                  }
                }).promise();
        
            } catch (error) {
                console.log(error);
                return;
            }  

            break;
        default:
            callback("400 Invalid Operator");
            break;
    }

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin" : "*" // Required for CORS
        },
        body: metaList,
    };

    return response;
};