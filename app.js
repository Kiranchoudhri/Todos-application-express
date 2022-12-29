const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;

  const getTodoQuery = `
     SELECT * FROM todo
     WHERE
     status LIKE "${status}"
     OR priority LIKE "${priority}"
     OR todo LIKE "%${search_q}%";
    `;

  const todoArray = await db.all(getTodoQuery);
  response.send(todoArray);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
     SELECT * FROM todo
     WHERE
     id = ${todoId};
    `;

  const todoArray = await db.all(getTodoQuery);
  response.send(todoArray);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  console.log(todoDetails);
  const { id, todo, priority, status } = todoDetails;
  const postTodoQuery = `
  INSERT INTO todo (id, todo, priority, status)
  VALUES (${id}, "${todo}", "${priority}", "${status}");
  `;

  const dbResponse = await db.run(postTodoQuery);
  const TodoId = dbResponse.lastId;
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const todoDetails = request.body;
  const { todoId } = request.params;

  const title = Object.keys(todoDetails)[0];
  const { todo, priority, status } = todoDetails;
  const updateTodoQuery = `
  UPDATE todo SET
    ${title} = "${todoDetails[title]}"
    WHERE id = ${todoId};
  `;

  await db.run(updateTodoQuery);

  response.send(`${title} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo
    WHERE id = ${todoId}
    `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = express;
