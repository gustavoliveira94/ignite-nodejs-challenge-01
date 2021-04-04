const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.filter(user => user.username === username)[0];

  if (!user) {
    return response.status(400).json({ error: 'User not found!' });
  }

  request.username = user.username;

  return next();
}

app.get('/users', (request, response) => {
  return response.status(201).json(users);
});

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  const user = {
    id: v4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.filter(user => user.username === username)[0];

  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const todo = {
    id: v4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  const user = users.filter(user => user.username === username)[0];

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users.filter(user => user.username === username)[0];
  const todoExists = user.todos.some(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({
      error: 'Todo not found!'
    })
  }

  const todo = user.todos.filter(todo => todo.id === id)[0];

  todo.title = title;
  todo.deadline = deadline;

  response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.filter(user => user.username === username)[0];
  const todoExists = user.todos.some(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({
      error: 'Todo not found!'
    })
  }

  const todo = user.todos.filter(todo => todo.id === id)[0];

  todo.done = true;

  response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.filter(user => user.username === username)[0];

  const todo = user.todos.some(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'User not found!' });
  }

  const excludeTodo = user.todos.filter(todo => todo.id !== id);

  user.todos = excludeTodo;

  return response.status(204).json(user);
});

module.exports = app;