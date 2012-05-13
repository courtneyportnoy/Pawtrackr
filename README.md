This is Pawtrackr, an app that allows you to create a profile for your dogs, find local dog parks, and (eventually), 
follow friends and parks.

Much of this code was possible from John Schimmel's many examples for our Dynamic Web Development class [John Schimmel](https://github.com/johnschimmel). 
This app uses the MongoDB database, as well as Amazon S3 for storing uploaded files.

# Set up file structure and Heroku App

In your terminal, clone this repo

	git clone git@github.com:cmcrew/PT.git


If you haven't already, create a new app on Heroku (cedar), this will add an additional remote GIT path to Heroku. (Assumes you have [Heroku Toolbelt](https://toolbelt.heroku.com/) installed)

	heroku create --stack cedar

# Set up MongoDB and .env

Add free [MongoLab account add-on](https://addons.heroku.com/mongolab) for your MongoDB 

	heroku addons:add mongolab:starter

Heroku and MongoLab have provided a mongodb:// connection string in your Heroku config. This is your "username and password" to get access. We can keep the connection string out of the code and private by putting it inside a .env environment variable file. 

Get your connection URI

	heroku config | grep MONGOLAB_URI

Copy the Mongo URI connection string starting from **mongodb://** to the end, will look like

    mongodb://heroku_randomapp:hashedpassword@subdomain.mongolab.com:port/heroku_randomapp
    
Add local config variable for MongoLab

    echo MONGOLAB_URI=mongodb://heroku_randomapp:hashedpassword@subdomain.mongolab.com:port/heroku_randomapp >> .env
    
    
-------

## Amazon S3

### Sign up for S3
To sign up for Amazon S3, click the “Sign up for This Web Service” button on the [Amazon S3 detail](http://aws.amazon.com/s3/) page. You must have an Amazon Web Services account to access this service; if you do not already have one, you will be prompted to create one when you begin the Amazon S3 sign-up process.

### Set up a bucket
When you have your account set up, you can set up your first Bucket in the [AWS S3 Console](http://aws.amazon.com/s3/). On the left panel, click the "Create Bucket", fill in the Bucket name field. Leave the 'Region' as 'US Standard'. Click the Create button to finish and create the bucket.

Add Amazon S3 config variables for local dev

    echo AWS_KEY=YOUR_AWS_KEY >> .env
    echo AWS_SECRET=YOUR_AWS_SECRET >> .env

Add Amazon S3 config variables to Heroku config. These variables will be used on the LIVE herokuapp.com servers.

    heroku config:add AWS_KEY=YOUR_AWS_KEY AWS_SECRET=YOUR_AWS_SECRET

This code uses the [Knox NodeJS S3](https://github.com/LearnBoost/knox) module. It works great, you can see the code implementation in **/routes/user.js**.

**Last step, add your bucket name.** Open **/routes/user.js** change line 2 with your bucket name

    // CHANGE THIS TO YOUR BUCKET NAME
    var myBucket = 'YOUR_BUCKET_NAME';
  
-------

## Foursquare API

### Create a developer account for Foursquare
To create a new app using the Foursquare API, click the "My Apps" button at the top of the [Foursquare Developer](https://developer.foursquare.com/index) page. Then click "Register a New Consumer" at the top. You must have a Foursquare account to access this service.

### Set up a new App
Enter your app name and information in the form. To create a local dev app, use http://127.0.0.1:5000 for your app URL and http://127.0.0.1:5000/auth/foursquare/callback for your callback URL. After clicking submit, you will receive your FOURSQUARE API Client id and Client secret.

Add Foursquare config variables for local dev

    echo FOURSQUARE_CLIENT_ID=YOUR_FOURSQUARE_CLIENT_ID >> .env
    echo FOURSQUARE_CLIENT_SECRET=YOUR_FOURSQUARE_CLIENT_SECRET >> .env

Add Foursquare config variables to Heroku config. These variables will be used on the LIVE herokuapp.com servers.

    heroku config:add FOURSQUARE_CLIENT_ID=YOUR_FOURSQUARE_CLIENT_ID FOURSQUARE_CLIENT_SECRET=YOUR_FOURSQUARE_CLIENT_SECRET

-------

# Get the party started


## Install Node Modules

    npm install
    
## Run locally

    foreman start
    
Visit on your browser at [http://localhost:5000](http://localhost:5000)

------- 

# Run on Heroku

Commit all changes

    git commit -am "my commit message"
    
Push to Heroku

    git push heroku master
    
Open in browser the lazy man way

    heroku open
    
