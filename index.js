require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

const app = express();

app.use(express.static('build'))
app.use(cors());
app.use(express.json());

morgan.token('data', (req, res) => JSON.stringify(req.body) );

const customResponse = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.data(req, res)
  ].join(' ')
});

app.use(customResponse);

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => res.json(people));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => res.json(person))
    .catch(err => next(err));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (Person.find({ name: body.name })) {
    return res.status(400).json({ error: 'no duplicate names' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(err => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(err => next(err));
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

app.get('/info', (req, res, err) => {
  const time = new Date();

  Person.find({})
    .then(persons => {
      res.send(`Phonebook has info for ${persons.length} people <br> ${time}`)
    })
    .catch(err => next(err))
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});