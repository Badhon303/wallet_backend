// const mongoose = require('mongoose');
// const validator = require('validator');
// const { toJSON, paginate } = require('./plugins');

// const userDocumentSchema = new mongoose.Schema({
//   nidFront: {
//     type: String,
//     default: 'nid_front.jpg',
//   },
//   nidBack: {
//     type: String,
//     default: 'nid_back.jpg',
//   },
//   passportBiodata: {
//     type: String,
//     default: 'passport_biodata.jpg',
//   },
//   drivingFront: {
//     type: String,
//     default: 'driving_front.jpg',
//   },
//   drivingBack: {
//     type: String,
//     default: 'driving_back.jpg',
//   },
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User',
//     required: true,
//   },
// });

// /**
//  * @typedef UserDocument
//  */
// const UserDocument = mongoose.model('UserDocument', userDocumentSchema);

// module.exports = UserDocument;
