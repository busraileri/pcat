const fs = require('fs');
const path = require('path');
const Photo = require('../models/Photo');


exports.getAllPhotos = async (req, res) => {
  const page = req.query.page || 1;                        // initial page
  const photosPerPage = 3;                                 // number of photos per page
  const totalPhotos = await Photo.find().countDocuments(); // total imgs 

  const photos = await Photo.find({})                      // to take the photos  
  .sort('-dateCreated')                                   
  .skip((page-1) * photosPerPage)                          // each page has its own
  .limit(photosPerPage)                                    // limit the number of images I want on each page
  
 
  
  
  res.render('index', {
    photos:photos,
    current:page,
    pages:Math.ceil(totalPhotos/photosPerPage)
  });
};

exports.getPhoto = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('photo', {
    photo,
  });
};

exports.createPhoto = async (req, res) => {
  const uploadDir = path.join(__dirname, '/../public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let uploadedImage = req.files.image;
  let uploadPath = path.join(uploadDir, uploadedImage.name);

  uploadedImage.mv(uploadPath, async (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    try {
      await Photo.create({
        ...req.body,
        image: '/uploads/' + uploadedImage.name,
      });
      res.redirect('/');
    } catch (err) {
      res.status(500).send('Error saving photo: ' + err);
    }
  });
};

exports.updatePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  res.redirect(`/photos/${req.params.id}`);
};

exports.deletePhoto = async(req,res)=>{
    const photo = await Photo.findOne({_id: req.params.id})
    let deletedImage = path.join(__dirname, '/../public', photo.image);
    fs.unlinkSync(deletedImage);
    await Photo.findByIdAndDelete(req.params.id)
    res.redirect('/')
};
  