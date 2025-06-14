const validator = require('validator');

const validateSignup = function (req) {
  const { firstName, lastName, emailId, age, gender } = req.body;

  if (!firstName || !validator.isAlpha(firstName, 'en-US', { ignore: ' -' })) {
    throw new Error('First name must contain only alphabets.');
  }

  if (!lastName || !validator.isAlpha(lastName, 'en-US', { ignore: ' -' })) {
    throw new Error('Last name must contain only alphabets.');
  }

  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error('Invalid email address.');
  }

  if (!age || !validator.isInt(age.toString(), { min: 1, max: 150 })) {
    throw new Error('Age must be a valid number between 1 and 150.');
  }

  const validGenders = ['male', 'female', 'other'];
  if (!gender || !validGenders.includes(gender.toLowerCase())) {
    throw new Error('Gender must be one of male, female, or other.');
  }
};

module.exports = validateSignup;
