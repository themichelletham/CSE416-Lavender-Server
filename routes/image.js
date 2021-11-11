const express = require("express");
const router = express.Router();
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();
const {cloudinary} = require('./utils/cloudinary');


router.get("/", (req, res) =>{
    res.send("Hello search");
});


router.post ("/", (req, res) =>{
    res.send("Hello search");
});


//images cannot exceed 50mb
router.post('/image-upload', async (req,res) =>{
    
    
    try {
        const fileStr = req.body.data;
        // console.log(fileStr);
        const uploadedResponse = await cloudinary.uploader
        .upload(fileStr, {upload_preset: "ik2fkzsl"})
        console.log(uploadedResponse);
        res.json({msg: "YAYY"})
        return;
    }catch(error){
        console.error(error)
        res.status(500).json({err: "something went wrong with cloudiary"})
        return;
    }

});

module.exports = router
