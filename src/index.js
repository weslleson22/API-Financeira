const express = require("express");
const app = express();
const port = 3333;
const { v4: uuidv4 } = require("uuid");
const customers = [];
/**
 * cpf - string
 * name - string
 * id - UUID
 * statement - array []
 */

function getBalance(statement) {
  const balance = statement.reduce(
    (acc, operation) =>
      operation.type === "credit"
        ? acc + operation.amount
        : acc - operation.amount,
    0
  );

  return balance;
}
app.use(express.json());
//Middlewares
function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;
  const customer = customers.find((costumer) => costumer.cpf === cpf);
  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
  }
  req.customer = customer;
  return next();
}
/**
 *
 * Routes
 *
 */

// Feature: Create a account
app.post("/account", (req, res) => {
  const { name, cpf } = req.body;
  const customersAlreadyExist = customers.some(
    (customer) => customer.cpf === cpf
  );
  if (customersAlreadyExist) {
    return res.status(400).json({ error: "Customer already exists!" });
  }
  customers.push({
    id: uuidv4(),
    name,
    cpf,
    statement: [],
  });
  return res.status(201).send();
});

//Feature:  Search a statement
app.get("/statement/", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.status(200).json(customer.statement);
});

//Feature:  Make deposit to account
app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { description, amount } = req.body;
  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };
  customer.statement.push(statementOperation);
  res.status(201).send();
});

// Feature: Make withdraw
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);
  return response.status(201).send();
});
// Feature: Search statement by date
app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;
  const dateFormat = new Date(date + " 00:00");
  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );
  return res.status(200).json(statement);
});

// Feature: Update account details
app.put("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body;
  const { customer } = req;
  customer.name = name;
  return res.status(201).send();
});

// Feature: Get account details
app.get("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.status(200).json(customer);
});

// Feature: Delete account
app.delete("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const indexCustomer = customers.findIndex(
    (customersIndex) => customersIndex.cpf === customer.cpf
  );
  customers.splice(indexCustomer, 1);
  return res.status(204).send();
});
//Feature: Get All Accounts
app.get("/account/all", (req, res) => {
  return res.status(200).json(customers);
});

// Feature: Get Balance
app.get("/balance", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const balance = getBalance(customer.statement);
  return res.status(200).json(balance);
});
app.listen(port, () => {
  console.log(`O Servidor está rodando na porta ${port}`);
});