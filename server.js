const express = require("express");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PORT = 3000;

var serviceAccount = require("./api.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();



app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('log');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'thisisASecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
}));

app.use(express.static(path.join(__dirname, 'public')));

// Route handler for the sign page
app.get('/sign', (req, res) => {
    res.render('sign');
});
app.get('/sign', (req, res) => {
    res.redirect('log');
});

app.get('/index', (req, res) => {
    res.render('index');
})

// Route handler for signin form submission
app.post('/sign', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set user details in Firestore
    await setDoc(doc(db, 'users', email), {
        username,
        email,
        password: hashedPassword
    });

    res.redirect('/log');
});

// Route handler for the login page
app.get('/log', (req, res) => {
    res.renderFile(__dirname,"/index.html");
});

app.get('/log', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    db.collection('users')
        .where("email", "==", email)
        .where("password", "==", password)
        .get().then((docs) => {
            console.log(docs);
        });
});


app.get('/sign', (req, res) => {
    const username = req.query.username;
    console.log("username:", username);
    const email = req.query.email;
    console.log("email:", email);
    const password = req.query.password;
    console.log("password:", password);
    db.collection('users').add({
        name: username,
        email: email,
        password:password
    }).then(()=>{
        res.send("SignUp Sucessfully");
    })
})


// // Route handler for login form submission
// app.post('/log', async (req, res) => {
//     const { email, password } = req.body;
//     const userDoc = await db.collection('users').doc(email).get();
    
//     if (!userDoc.exists) {
//         return res.status(400).send("User does not exist");
//     }
    
//     const user = userDoc.data();
//     const isMatch = await bcrypt.compare(password, user.password);
    
//     if (isMatch) {
//         req.session.userId = userDoc.id;
//         req.session.username = user.username;
//         res.redirect('views/index.html');
//     } else {
//         res.status(400).send("Incorrect Password");
//     }
// });

// Route handler for the dashboard page
// app.get('/sign', (req, res) => {
//     if (req.session.userId) {
//         return res.render('/views/index.html');
//     } else {
//         res.redirect('/views/index.html');
//     }
// });

app.listen(PORT, () => {
    console.log(`Server is running on: https://localhost:${PORT}`);
});
