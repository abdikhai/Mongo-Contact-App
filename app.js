const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact');

const app = express();
const port = 3000;

// setup method override
app.use(methodOverride('_method'));

// setup JES
app.set('view engine', 'ejs'); // gunakan ejs
app.use(expressLayouts); // third-party middleware
app.use(express.static('public')); // build-in middleware
app.use(express.urlencoded({ extended: true })); // build-in middleware

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.listen(port, () => {
  console.log(`Mongo Contact App | listening at http://localhost:${port}`);
});

//halaman home
app.get('/', (req, res) => {
  const mahasiswa = [
    {
      nama: 'Khairul Abdi',
      email: 'abdi@gmail.com',
    },
    {
      nama: 'Bryan',
      email: 'bryan@gmail.com',
    },
    {
      nama: 'Akram',
      email: 'akram@gmail.com',
    },
  ];
  res.render('index', {
    layout: 'layouts/main-layout',
    nama: 'Khairul Abdi',
    title: 'Halaman Home',
    mahasiswa,
  });
});

//halaman about
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'Halaman About',
    layout: 'layouts/main-layout',
  });
});

//halaman Contact
app.get('/contact', async (req, res) => {
  const contacts = await Contact.find();

  res.render('contact', {
    title: 'Halaman Contact',
    layout: 'layouts/main-layout',
    contacts,
    msg: req.flash('msg'),
  });
});

// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layout',
  });
});

// proses tambah data Contact
app.post(
  '/contact',
  [
    body('nama').custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error('Nama Contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'Nomor HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        //kirimkan flash message
        req.flash('msg', 'Data contact berhasil ditambahkan!');
        res.redirect('/contact');
      });
    }
  }
);

// halaman hapus data
app.delete('/contact', (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash('msg', 'Data contact berhasil dihapus!');
    res.redirect('/contact');
  });
});

// form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layout',
    contact,
  });
});

// proses ubah data
app.put(
  '/contact',
  [
    body('nama').custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error('Nama Contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'Nomor HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        //kirimkan flash message
        req.flash('msg', 'Data contact berhasil diubah!');
        res.redirect('/contact');
      });
    }
  }
);

// halaman detail contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render('detail', {
    title: 'Halaman Detail Contact',
    layout: 'layouts/main-layout',
    contact,
  });
});
