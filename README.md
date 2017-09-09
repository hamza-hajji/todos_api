# TODO API With MongoDB and Express
 ## Register a new user
 `POST /users`
 Pass a json object like this:
```javascript
{
  "email": "name@example.com",
  "password": "123"
}
```

You get JSON Web Token that you pass to all requests via the header `x-auth`.

# Add new TODO
#### url: `POST /todos`
#### body:

```javascript
{
  "text": "Do something",
  "completed": false, // default
}
```
You get an ID that you use to edit the todo or delete it.

# Get a TODO
#### url: `GET /todos/todoID`
#### response:

```javascript
{
  "text": "Do something",
  "completed": false
}
```

# Edit a TODO
#### url: `PATCH /todos/todoID`
#### body:

```javascript
{
  "text": "Edited text",
  "completed": true
}
```

# Remove a TODO
#### url: `DELETE /todos/todoID`
#### response:

```javascript
{ // the deleted todo
  "text": "Edited text",
  "completed": true
}
```

# Get all your TODOs
#### url: `GET /todos`
#### response:

```javascript
{
  todos: [{
    "text": "TODO 1",
    "completed": true
  },
  {
    "text": "TODO 2",
    "completed": false
  }, ...]
}
```
