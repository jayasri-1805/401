const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const serviceAccount = require("./key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`); 
    next();
});
app.get('/login', (req, res) => {
    res.render('login', { message: null }); 
});
app.get('/signup', (req, res) => {
    res.render('signup', { message: null });
});
app.post('/signupsubmit', async (req, res) => {
    console.log("Signup request received:", req.body);
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.render('signup', { message: "All fields are required!" });
        }
        const existingUser = await db.collection("userdemo")
            .where("email", "==", email)
            .get();
        if (!existingUser.empty) {
            return res.render('signup', { message: "Email already registered. Please log in." });
        }
        await db.collection("userdemo").add({
            username,
            email,
            password  
        });
        res.render('login', { message: "Signup successful! Please log in." }); 
    } catch (error) {
        console.error("Error saving to database:", error);
        res.render('signup', { message: "An error occurred. Please try again." });
    }
});
app.post('/loginsubmit', async (req, res) => {
    console.log("Login request received:", req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.render('login', { message: "Please provide both email and password." });
        }
        const snapshot = await db.collection("userdemo")
            .where("email", "==", email)
            .where("password", "==", password)
            .get();
        if (!snapshot.empty) {
            return res.render('dashboard', { userEmail: email }); 
        } else {
            res.render('login', { message: "Invalid credentials. Please try again." });
        }
    } catch (error) {
        console.error("Error fetching from database:", error);
        res.render('login', { message: "An error occurred. Please try again." });
    }
});
app.get('/dashboard', (req, res) => {
    res.render('dashboard'); 
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});