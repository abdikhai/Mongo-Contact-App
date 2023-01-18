const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/wpu', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//Menambah 1 data
// const contact1 = new Contact({
//   nama: 'Khairul Abdi',
//   nohp: '082323239231',
//   email: 'abdi@gmail.com',
// });

// //simpan ke collection
// contact1.save().then((contact) => {
//   console.log(contact);
// });
