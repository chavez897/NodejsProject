require('dotenv').config()
module.exports = {
    url : `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.nwlkm13.mongodb.net/?retryWrites=true&w=majority`
};