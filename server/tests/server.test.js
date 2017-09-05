const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('../server');
var {Todo} = require('../models/todo');
var {User} = require('../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Do something';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if(err) return done(err);

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a todo with invalid data', (done) => {

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find() .then((todos) => {
          expect(todos.length).toBe(2);
          done()
        }).catch((e) =>  done(e));
      });
  })
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {
  it('should return the todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('should return 404 if todo is not found', (done) => {
    // make sure you get 404
    request(app)
      .get(`/todos/${(new ObjectID()).toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    // /todos/123
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
});


describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var id = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
        }).catch((e) => done(e));
        done();
      });
  });

  it('should return 404 if todo is not found', (done) => {
    request(app)
      .delete(`/todos/${(new ObjectID()).toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var id = todos[0]._id.toHexString();
    var textToChange = "changed text";

    request(app)
    .patch(`/todos/${id}`)
    .send({ text: textToChange, completed: true })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(textToChange);
      expect(res.body.todo.completed).toBe(true);
      expect(res.body.todo.completedAt).toBeA('number');
    })
    .end(done);
  });
  it('should clear completedAt when todo is not completed', (done) => {
    var id = todos[1]._id.toHexString();
    var textToChange = "changed text 2";

    request(app)
    .patch(`/todos/${id}`)
    .send({ text: textToChange, completed: false })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(textToChange);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toNotExist();
    })
    .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'exampe-user@mail.com';
    var password = '123bvv';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) return done(err)

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        });
      });
  });
  it('should return validation error if req is invalid', (done) => {
    var email = 'user.com'
    var password = '12345';
    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done)
  });
  it('should not create user if email is unavailable', (done) => {
    var email = 'user.com'
    var password = 'hamza@mail.com';
    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done)
  });
})

describe('GET /users/me', () => {
  it('should return the user document if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return the 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  })
});
