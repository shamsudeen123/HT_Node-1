import nodemailer from "nodemailer";

const smtpProtocol = nodemailer.createTransport({

  host: "smtp.gmail.com",

  port: 587,

  auth: {

    user: "info@uniflytourism.com",

    pass: "uniflytourism@2021"

  },

  tls: {

    secure: false,

    ignoreTLS: true,

    rejectUnauthorized: false

  }

});

 

export const sendConfirmationEmail = (req, res) => {

  const { adminEmail, email, name, phoneNumber, description } = req.body;

  smtpProtocol.sendMail({

    from: adminEmail,

    to: adminEmail,

    subject: "Equiry Form",

    html: `<h1>Equiry Details</h1>

          <h6>Customer Name - ${name}</h6>
          <h6>Customer Email - ${email}</h6>
          <h6>Customer Phone Number - ${phoneNumber}</h6>
          <h6>Message - ${description}</h6>

          </div>`,

  })
  .then(() => res.status(200).send("Email send successfully!"))
  .catch(err => res.status(500).send(err));

};