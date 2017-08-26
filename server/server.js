var app = require('express')();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// POST /todos
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((todo) => {
    res.send(todo);
  }, (err) => {
    res.status(400).send(err);
  });
});

// GET /todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos}); // {todos: [...], } to add more props later
  }, (err) => {
    res.status(400).send(err);
  });
});

// GET /todos/123
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  // validate ID
    // if not valid => 404, {}
  // findById
    // success
      // if there is todo => send it
      // if not => send 404, {}
    // error
      // 400 - send {}
  if (!ObjectID.isValid(id)) return res.status(404).send({});

  Todo.findById(id).then((todo) => {
    if (!todo) return res.status(404).send({});
    res.send({todo});
  }, (e) => {
    console.log(e);
    res.status(400).send({})
  });
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  // get the id
  var id = req.params.id;
  // validate the id
  if(!ObjectID.isValid(id)) {
    // return 404
    res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) res.status(404).send();
    res.send({todo});
  }, (err) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
