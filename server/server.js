const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var Todo = mongoose.model('Todo', {
  text: {
    type: String
  },
  completed: {
    type: Boolean
  },
  completedAt: {
    type: Number
  }
});

var todo = new Todo({
  text: 'Cook dinner'
});

var todo2 = new Todo({
  text: 'Eat dinner',
  completed: false,
  completedAt: 123
})

todo.save().then((todo) => {
  console.log('Saved: ', todo);
}, (e) => {
  console.log('Unable to save todo', err);
});

todo2.save().then((todo) => {
  console.log('Saved: ', todo);
}, (e) => {
  console.log('Unable to save todo', err);
});
