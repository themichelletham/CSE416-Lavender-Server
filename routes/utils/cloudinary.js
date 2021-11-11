const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: "lavender-sprout-herokuapp-com",
    api_key: "799574661412464",
    api_secret: "wRS8waYD7SYlE8p76iVoecldWKI",
});

module.exports = {cloudinary};