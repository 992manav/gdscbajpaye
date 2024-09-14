const express = require('express');
const mongoose = require('mongoose');
const User = require('./model/user');
const signjwt = require('./zod');
const Admin = require('./model/admin');
const Course = require('./model/projects');
const jwt = require("jsonwebtoken");
const axios = require('axios');
const sendMail = require('./sendMail');
const path = require('path');

// Google reCAPTCHA secret
const googlesecret = "6LeKUkMqAAAAAAKFXVeTYX6wamZd_vA-lmzMXbxQ";
const app = express();

mongoose.connect('mongodb+srv://adityabajpayee7:qpgNZTuia1cQTJc1@cluster0.m5acueb.mongodb.net/gdsc')
  .then(() => { console.log("connected to database") })
  .catch((error) => { console.log(error) });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post("/signup", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const confpassword = req.body.confpassword;
        const usertype = req.body.value;
        const captcha = req.body.captcha;

        try {
            const { data } = await axios({
                url: `https://www.google.com/recaptcha/api/siteverify?secret=${googlesecret}&response=${captcha}`,
                method: "POST"
            });

            console.log(data);
            if (data.success) {
                if (!signjwt(email, password)) {
                    return res.status(400).send("invalid email or password");
                } else {
                    const token = signjwt(email, password);
                    if (usertype === "admin") {
                        const userexist = await Admin.findOne({ email });
                        if (userexist) {
                            return res.status(400).send("user already exists");
                        }
                        if (password !== confpassword) {
                            console.log(password);
                            console.log(confpassword);
                            return res.status(400).send("password and confirm password do not match");
                        }
                        const user = await Admin.create({ name, email, password, usertype });
                        sendMail(email, `Welcome to the Website ${usertype}`, `Hi, ${name} thank you for registering. Please Sign in using the link below`,
                            `click http://localhost:5173/signin`
                        );
                        res.status(200).json(user);
                    } else {
                        const userexist = await User.findOne({ email });
                        if (userexist) {
                            return res.status(400).send("user already exists");
                        }
                        if (password !== confpassword) {
                            return res.status(400).send("password and confirm password do not match");
                        }
                        const user = await User.create({ name, email, password, usertype });
                        sendMail(email, `Welcome to the Website ${usertype}`, `Hi, ${name} thank you for registering. Please Sign in using the link below`,
                            `click "https://GDSCbajpayee/onrender.com/signin"`
                        );
                        res.status(200).json(user);
                    }
                }
            } else {
                return res.status(400).send("captcha verification failed");
            }
        } catch (error) {
            res.status(400).json({ message: "invalid captcha" });
        }
    } catch (err) {
        console.error("error is there", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/signin", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const usertype = req.body.value;

        if (!email || !password || !usertype) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user;
        if (usertype === "admin") {
            user = await Admin.findOne({ email });
        } else {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        if (password === user.password) {
            return res.status(200).json({ message: "okay" });
        } else {
            return res.status(401).json({ message: "Password is incorrect" });
        }

    } catch (err) {
        console.error("Error during sign-in:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/dashboard/create/:name", async (req, res) => {
    try {
        const name = req.params.name;
        const photo = req.body.photo;
        const link = req.body.link;
        const course = await Course.create({ name, photo, link });
        res.status(201).json(course);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.get("/dashboard/projects", async (req, res) => {
    try {
        const projects = await Course.find({});
        res.status(200).json(projects);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.delete("/dashboard/projects/:name", async (req, res) => {
    try {
        const name = req.params.name;
        const project = await Course.findOneAndDelete({ name });
        if (!project) {
            res.status(404).json({ message: "project not found" });
        } else {
            res.status(200).send({ message: "project deleted" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000, () => {
    console.log('server is running on port 3000');
});
