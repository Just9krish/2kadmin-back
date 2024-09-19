function checkValidEmail(email) {
  // Regular expression for a basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function checkValidMobileNumber(mobileNumber) {
  // Regular expression for a basic mobile number validation
  const mobileRegex = /^\d{10}$/;
  return mobileRegex.test(mobileNumber);
}

function generateCode() {
  // Generate a random number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString(); // Convert the number to a string
}

module.exports = { checkValidEmail, checkValidMobileNumber, generateCode };
