const config = require("./config");

function welcome(name) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
      
    </head>
    <body>
      <div class="email-container p-2 text-center">
        <div class="py-2"></div>
        <h1 class="text-center">Hi ${name},Welcome to ${config.companyName}!</h1>
        <p>We're thrilled to have you on board. Let's serve you with the best inclass cullinary artistry in Nigeria.</p>
        <div class="p-space py-1"></div>
        <small><i>For support, contact us via</i> <br><a href="mailto:${config.replyToMail}">Company Mail: ${config.replyToMail}</a> <br> <a href="tel://:${config.companyCallLine}">Call: ${config.companyCallLine} </a> </small>
      </div>
    </body>
    </html>`;
}

function verify(name, userId, verifyToken) {
  const verifyLink = `${
    config.productionAddress || `http://${config.host}:${config.port}`
  }/auth/verify?user=${userId}&token=${verifyToken}`;
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Email</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
  <style>
    .w-max-content {
      width: max-content
    }
    body{
      color: #264f03;
    }
    .button-1 {
    background: gray;
      color: white;
      border: 0px solid;
      border-radius: 6px;
      padding: 7px 30px;
    }
    .p-space{
      padding: 8px 0px;
    }
  </style>
</head>
<body>
  <div class="email-container p-2 text-center">
    <div class="py-2"></div>
    <h1>Verify Your Email</h1>
    <p>Hi ${name}, Please click the button below to verify your email address. If you didn't sign up for the account, kindly ignore this email.</p>
    <a href="${verifyLink}" class="button-1">Verify Email</a>
    <div class="p-space py-1"></div>
     <small><i>For support, contact us via</i> <br><a href="mailto:${config.replyToMail}">Company Mail: ${config.replyToMail}</a> <br> <a href="tel://:${config.companyCallLine}">Call: ${config.companyCallLine} </a> </small>
  </div>
</body>
</html>
  `;
}

function passwordReset(name, resetToken) {
  let frontEndAddr = "https://selaconnect.netlify.app"

  const resetLink = `${frontEndAddr}/password-reset?resetToken=${resetToken}`;
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
</head>
<body>
  <div class="email-container p-2 text-center">
    <h5>Hello ${name},</h5>
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}" class="button-1">Reset Password</a>
    <div class="p-space py-1"></div>
     <small><i>For support, contact us via</i> <br><a href="mailto:${config.replyToMail}">Company Mail: ${config.replyToMail}</a> <br> <a href="tel://:${config.companyCallLine}">Call: ${config.companyCallLine} </a> </small>
  </div>
  </div>
</body>
</html>
  `;
}


const reply = (email, replyMessage) => `
  <html>
  <body>
    <p>Dear ${email},</p>
    <p>Thank you for reaching out to us. Here is our reply to your message:</p>
    <blockquote>${replyMessage}</blockquote>
    <p>Best regards,<br>${config.companyName}</p>
    <div style="height: 20px;"></div>
    <small><i>For support, contact us via</i> <br>Company Mail: joegreencafeteriaservice@gmail.com <br> Call: 0916478 0187, 07043536861 </small>
  </body>
  </html>
`;

module.exports = {
  welcome,
  verify,
  passwordReset,
  reply
};
