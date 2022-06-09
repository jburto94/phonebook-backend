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

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => res.json(person));
});

app.post('/api/persons', (req, res) => {
  const body = req.body;
  const newId = Math.round(Math.random(100000000) * 100000000);

  const person = {
    id: newId,
    name: body.name,
    number: body.number
  };

  if (!(person.name && person.number)) {
    return res.status(400).json({
      "error": "name and number are required"
    })
  } else if (persons.find(p => p.name === person.name)) {
    return res.status(406).json({
      "error": "name must be unique"
    })
  }

  persons = persons.concat(person);
  res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
});

app.get('/info', (req, res) => {
  const message = `Phonebook has info for ${persons.length} people`;
  const date = String(new Date());
  res.send(`${message} <br> ${date}`);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});