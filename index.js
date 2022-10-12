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

  console.log('S3 PUT log: ', event.Records[ 0 ].s3);

  // grab things
  const {
    bucket,
    object
  } = event.Records[ 0 ].s3;

  // read object metadata
  // '.send' executes any command that we want to run on the S3 service (go ahead and shoot this comamnd to S3)
  /* new way to do things that doesn't work, yet
  let uploadedFile = await s3Client.send(new GetObjectCommand({
    Bucket: bucket.name,
    // Key is the file's/object's name
    Key: object.key
  }));
  */

  let uploadedImage = await s3Client.getObject({
    Bucket: bucket.name,
    Key: object.key
  }).promise();
  console.log('uploadedImage: ', uploadedImage);

  let uploadedFile = await s3Client.getObject({
    Bucket: bucket.name,

    // Key is the file's/object's name
    // in this case, we always want to read from the 'images.json' that's in this
    // bucket's /images folder
    Key: 'images.json'
  }).promise();
  console.log('uploadedFile: ', uploadedFile);

  // for logging an uploaded JSON object
  // parse the stringified json object
  // this line is so we can read the json object
  let jsonObject = JSON.parse(uploadedFile.Body.toString());
  console.log('jsonObject .Body.toString() thing: ', jsonObject);

  /* up to this point, we've only granted access to 'get'*/

  // from here, I'm thinking I can add records to the `jsonObject` thingy
  // then do a `PUT` back into th

  //jsonObject.poopoo = 'peepee';

  let newObject = await s3Client.putObject({
    Bucket: bucket.name,
    Key: 'images.json',
    Body: JSON.stringify(jsonObject), // what goes here?
  }).promise();

  console.log('jsonObject index 1: ', jsonObject[ 0 ]);

  console.log('newObject with pup n pip: ', newObject);
  console.log('updated jsonObject: ', jsonObject);

  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
