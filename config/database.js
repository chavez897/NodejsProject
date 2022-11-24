require('dotenv').config()
module.exports = {
    url : `mongodb+srv://sourav1998:${process.env.PASSWORD}@cluster0.nwlkm13.mongodb.net/sample_restaurants?retryWrites=true&w=majority1`
};