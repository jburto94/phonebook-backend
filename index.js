const express = require('express');
const morgan = require('morgan');

const app = express();

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

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);
  console.log(person);

  person ?
    res.json(person) :
    res.status(404).end();
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});