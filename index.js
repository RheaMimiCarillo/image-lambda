// read from bucket?
// import built-in functionality
// new way to do things that doesn't work, yet
//const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// old way:
const AWS_SDK = require('aws-sdk');

// instantiate new s3Client instance with the region
// const s3Client = new S3Client( {region: 'us-west-2'});
// old way:
const s3Client = new AWS_SDK.S3();

exports.handler = async (event) =>
{
  //console.log('S3 PUT log: ', event.Records[ 0 ].s3);

  // grab things
  const {
    bucket,
    object
  } = event.Records[ 0 ].s3;
  //console.log('bucket: ', bucket);
  console.log('object: ', object);

  let newEntry = {
    name: object.key.split('/')[ 1 ].split('.')[ 0 ],
    fileType: object.key.split('/')[ 1 ].split('.')[ 1 ],
    size: `${ object.size } bytes`,
    bucket: bucket.name,
  };

  console.log('newEntry: ', newEntry);

  let imageJsonBody = [];
  const params = {
    Bucket: bucket.name,
    //in this case, we always want to read from the 'images.json'
    Key: 'images.json', //Key is the file's/object's name
  };

  let uploadedFile = await s3Client.getObject(params, function (err, data) 
  {
    if (err) 
    {
      console.log(err, err.stack);
      // file does not exist, do something
      console.log('error reading images.json, it might not exist');
      imageJsonBody = imageJsonBody[ imageJsonBody.length ] = newEntry;
      console.log('created new image.json body: ', imageJsonBody);
    }
    else 
    {
      console.log('data.Body.toString(): ', data.Body.toString());
      // file exists, do something

      // for logging an uploaded JSON object
      // parse the stringified json object
      // this line is so we can read the json object
      imageJsonBody = JSON.parse(data.Body.toString());
      console.log('read and parsed json file from bucket: ', imageJsonBody);

      // if name of image already in the image.json body
      if (imageJsonBody.some(current => current.name === newEntry.name))
      {
        console.log('found duplicate name');
        const i = imageJsonBody.findIndex(current => current.name === newEntry.name);
        imageJsonBody[ i ] = newEntry;
      }
      else
      {
        console.log('no duplicate found');
        imageJsonBody[ imageJsonBody.length ] = newEntry;
      }
    }

    console.log('imageJsonBody after adding entry: ', imageJsonBody);
  }).promise();
  
  //console.log('imageJsonBody right before write: ', imageJsonBody);
  
  let putParams = {
    Bucket: bucket.name,
    Key: 'images.json',
    Body: JSON.stringify(imageJsonBody), // what goes here?
  }

  let updatedImageJson = await s3Client.putObject(putParams, function (err, data) 
  {
    if (err) 
    {
      console.log(err, err.stack);
    }
    else
    {
      console.log("Put to s3 should have worked: " + data);
    }
  }).promise();

  console.log('updatedImageJson: ', updatedImageJson);

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
