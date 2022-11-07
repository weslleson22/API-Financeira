const {request, response} = require('express');

const express = require('express');
const app = express();

app.get("/", (request, response) =>{
    return response.send("teste");
});


app.listen(3334);