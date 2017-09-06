require('./config/config');

const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
var app = require('express')();

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const port = process.env.PORT;

app.use(bodyParser.json());

// POST /todos
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((todo) => {
    res.send(todo);
  }, (err) => {
    res.status(400).send(err);
  });
});

// GET /todos
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos}); // {todos: [...], } to add more props later
  }, (err) => {
    res.status(400).send(err);
  });
});

// GET /todos/123
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) return res.status(404).send({});

  Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
    if (!todo) return res.status(404).send({});
    res.send({todo});
  }, (e) => {
    console.log(e);
    res.status(400).send({})
  });
});

// DELETE /todos/:id
app.delete('/todos/:id', authenticate, (req, res) => {
  // get the id
  var id = req.params.id;
  // validate the id
  if(!ObjectID.isValid(id)) {
    // return 404
    res.status(404).send();
  }

  Todo.findOneAndRemove({ _id: id, _creator: req.user._id}).then((todo) => {
    if (!todo) res.status(404).send();
    res.send({todo});
  }, (err) => {
    res.status(400).send();
  });
});

// PATCH /todos/:id
app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);
  if(!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, { $set: body },  { new: true }).then((todo) => {
    if(!todo) return res.status(404).send();
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

// POST /users
app.post('/users', (req, res) => {
  var user = new User(_.pick(req.body, ['email', 'password']));

  user.save().then(() => {
    return user.generateAuthToken();
  })
  .then((token) => {
    res.header('x-auth', token).send(user);
  })
  .catch((err) => {
    res.status(400).send({err});
  });
});

// GET /users/me
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// POST /users/login
app.post('/users/login', (req, res) => {
  var {email, password} = req.body;

  User.findByCredentials(email, password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});


// DELETE /users/me/token
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token)
    .then(() => res.status(200).send({'message': 'successfuly deleted token'}))
    .catch((e) => res.status(400).send());
});

if (!module.parent) {
  app.listen(port, () => {
    console.log(`Started on port ${port}`);
  });
}

module.exports = {app};
