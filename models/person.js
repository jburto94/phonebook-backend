const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;
console.log('connecting to database');

mongoose
  .connect(url)
  .then(result => {
    console.log('connected to database');
  })
  .catch(err => {
    console.log('error connecting to database:', err.message);
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    unique: true,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        const full = /^\d{8,}/.test(v);
        const broken = /\d{2}-\d{6}/.test(v);
        return full || broken;
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: true
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
});

module.exports = mongoose.model('Person', personSchema);