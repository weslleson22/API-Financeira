const {request, response} = require('express');
const {v4: uuidv4} = require("uuid");
const express = require('express');
const app = express();
app.use(express.json());
const customers = [];
//Middleware
function verifyIfExistsAccountCPF(resquest, response, next){
    const {cpf} = request.headers;

    const customer = customers.find((customer)=> customer.cpf ===cpf);
    if(!customer){
        return response.send(400).json({error: "Customer not found"});
    }
    resquest.customer = customer;
    return next();
}
/*
cpf -string
name - string
id - uuid
statement []
*/
app.post("/account", (request, response) =>{
    const {cpf, name} = request.body;

    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );
    if (customerAlreadyExists){
        return response.status(400).json({error: "Customer aleready exists! "})
    }
    //const id = uuidv4();
    customers.push({
        cpf,
        name,
        id: uuidv4(), 
        statement:[]
    });
    return response.status(201).send();
});

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {

    const {customer} = request;
    return response.json(customer.statement);

});

app.post("/deposit", verifyIfExistsAccountCPF, (resquest, response)=>{
    const {description, amount} = request.body;
    const {customer} = resquest;
    const statementOperation = {
        description, amount,
        created_at: new Date(),
        type: "credit"
    }
    customer.statement.push(statementOperation);
    return response.status(201).send();
});

app.listen(3333);