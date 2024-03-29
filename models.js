// export Schemas to web.js
module.exports.configureSchema = function(Schema, mongoose) {
    
    // Image schema
    var ImageSchema = new Schema({
        filename: String,
        timestamp : { type: Date, default: Date.now }    
    });

    //Dog Info
    var DogSchema = new Schema({
        dogname : {type: String, required: true},
        breed : {type: String, required: true},
        gender : {type: String, required: true},
        profileImage : [ImageSchema],
        birthday : {
            month: String,
            day : String,
            year : String
        }
    });
    
    var ParkSchema = new Schema({
        parkname : String
        //foursquareID : String,
        //parkimage : String
    })
    
    // User Profile
    var UserSchema = new Schema({
        fsID: {type: Number , unique:true},
        name : {
            givenName: String,
            familyName: String
        },
        email : String,
        password: String,
        location: String,
        dogs: [DogSchema],
        friends: [DogSchema],
        parks:[ParkSchema],
        lastCheckin: String,
        tok : String
    });

    // add schemas to Mongoose
    mongoose.model('User', UserSchema);
    mongoose.model('Image', ImageSchema);
    mongoose.model('Dog', DogSchema);
    mongoose.model('ParkData', ParkSchema);
};