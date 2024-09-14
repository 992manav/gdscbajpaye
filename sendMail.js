const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: true, 
  auth: {
    user: "adityabajpayee7@gmail.com",
    pass: "tgwemtwmbyynmvbp",
  },
});


async function sendMail(to,subject,text,html) {

  const info = await transporter.sendMail({
    from: 'adityabajpayee7@gmail.com',
    to,
    subject,
    text,
    html,
  })
  .then(console.log("emeail sent"))
  .catch((error) => console.error(error));
}

module.exports = sendMail
