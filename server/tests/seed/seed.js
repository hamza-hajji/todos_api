const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
  _id: userOneID,
  email: 'hamza@mail.com',
  password: 'password4user1',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneID, access: 'auth'}, 'abc456').toString()
  }]
}, {
  id: userTwoID,
  email: 'user2@live.com',
  password: 'password4user2'
}];

const todos = [{
    _id: new ObjectID(),
    text: 'test todo'
  }, {
    _id: new ObjectID(),
    text: 'test todo 2',
    completed: true,
    completedAt: 333
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
}

module.exports = {todos, users, populateTodos, populateUsers};
