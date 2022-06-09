const mongoose = require('mongoose');

if (process.argv.length < 3) {
  return console.log('Please provide the password as an argument: node mongo.js <password>');
}

if (![3, 5].includes(process.argv.length)) {
  return console.log('Please provide the password as an argument: node mongo.js <password> <name> <number>');
}

const password = process.argv[2];

const url = `mongodb+srv://jburto94:${password}@cluster0.h8uym.mongodb.net/phonebook?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

mongoose
  .connect(url)
  .then(result => {
    console.log('connected');

    if (process.argv.length === 3) {
      Person.find({})
        .then(result => {
          console.log('phonebook:')
          result.forEach(person => console.log(`${person.name} ${person.number}`));
          return mongoose.connection.close();
        });
    }

    if (process.argv.length === 5) {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
      });

      person.save()
      .then(() => {
        console.log(`added ${person.name} number ${person.number} to phonebook`);
        return mongoose.connection.close();
      })
    }
  })
  .catch(err => console.log(err));