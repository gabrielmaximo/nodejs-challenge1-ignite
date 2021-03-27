const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const userFinded = users.find(user => request.headers.username === user.username)

  if(userFinded) {
    request.user = userFinded
    next()
  }
  else response.status(404).json({ error: "User does not exists" })
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => username === user.username)

  if(userAlreadyExists) return response.status(400).json({ error: "User Already Exists"})

  const user = { id: uuidv4(), name, username, todos: [] }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todo = { id: uuidv4(), title, done: false, deadline: new Date(deadline), created_at: new Date() }

  request.user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const todo = request.user.todos.find(todo => request.params.id === todo.id)

  if(!todo) return response.status(404).json({ error: 'Todo does not exists!' })

  todo.title = title
  todo.deadline = deadline

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const todo = request.user.todos.find(todo => request.params.id === todo.id)

  if(!todo) return response.status(404).json({ error: 'Todo does not exists!' })

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  
  const todoIndex = todos.findIndex(todo => request.params.id === todo.id)

  if(todoIndex === -1) return response.status(404).json({ error: 'Todo does not exists!' })
  
  todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;