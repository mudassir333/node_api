const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { response } = require('express');
const path = require('path');
const app = express();

const port = process.env.port || 5000;
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'api-tutorial',
});
const endPoints = {
    'post': '/members/add/',
    'getAll': '/members',
    'get': '/members/:id',
    'put': '/members/update',
    'delete': '/members/delete/:id',
}
const queries = {
    'select': 'SELECT * FROM members',
    'selected_id' :'SELECT  * FROM members WHERE ID = ?',
    'insert': 'REPLACE INTO members(id,name,dob,email,profile) VALUES ?',
    'update': 'UPDATE members SET name = ? ,dob = ?,email = ?,profile = ? WHERE id = ?',
    'delete': 'DELETE FROM members WHERE ID = ?',
}
const messages = {
    '200': 'success',
    'failed':'failed',
    '404': 'not found',
    '400': 'Bad Request'
}
function setRes(msg, code, data = null) {
    const response = {
        'status': code,
        'msg': msg,
    };
    if (data != null) {

        response['data'] = data;
        return JSON.stringify(response);
    }
    return JSON.stringify(response);
}
function connectWithServer(res, query, params = []) {
    try {
        pool.getConnection((err, conn) => {
            if (err) {
                console.log('Connection Error', err);
                const response = setRes(err.sqlMessage);
                res.send(response);
            }

            conn.query(query, params, (err, rows) => {
                if (err) {
                    console.log('Query Error', err);
                   const response = setRes(err.sqlMessage, 400); 
                    res.status(400);
                    res.send(response);
                }
                console.log('query results', rows);
                if (!query.includes('SELECT')) {
                    rows = null
                }
                const response = setRes(messages[200], res.statusCode, rows);
                res.status(res.statusCode);
                res.send(response);

            })

        });
    }
    catch (error) {
      //  throw new Error('Not found');
        console.log('error log',error);
       // res.status(404).
        //const response = setRes(messages[200], res.statusCode, rows);
               
    }
}
function getMethod(req, res) {
    connectWithServer(res, queries.select);
}
function getIdMethod(req, res) {
    connectWithServer(res, queries.selected_id,new Array(req.params.id));
}
function delIdMethod(req, res) {
    connectWithServer(res, queries.delete,new Array(req.params.id));
}
function putMethod(req, res) {
    const { id, name, email,dob,profile } = req.body;
    connectWithServer(res, queries.update,new Array(name,email,dob,profile,id));
}
function postMethod(req, res) {
    console.log('array', req.body);
    console.log(res.statusCode);
    console.log('flies',req.files);
    var file = req.files.profile;
    var img_name=file.name;
    const folder = './public/images/';
    file.mv('public/images/'+img_name,(err)=>{
        if(err){
            console.log('file saving error',err);
        }
        console.log('file saved',img_name);
    });
    const filePath = path.join(__dirname,folder+img_name);
    console.log('file path',filePath);
    let dataSet = []
    array = [];
    for (let key in req.body) {
        array.push(req.body[key]);
    }
    array.push(filePath);
    dataSet.push(array);
    console.log(dataSet);
    connectWithServer(res, queries.insert, new Array(dataSet));
    // for (let i = 0; i < req.body.length; i++) {
    //     const array = [];
    //     for (let key in req.body[i]) {
    //         array.push(req.body[i][key]);
    //     }
    //     array.push(img_name);
    //     console.log('array', array);
    //     dataSet.push(array);
    // }
  
}
//Connection pool



// get method

    app.get(endPoints.getAll, [getMethod]);
    app.get(endPoints.get, [getIdMethod])
    app.post(endPoints.post, [postMethod]);
    app.put(endPoints.put, [putMethod]);
    app.delete(endPoints.delete, [delIdMethod]);
    app.use((request, response, next) => {
        // Access response variable and handle it
         response.status(404).send(setRes('Service Not Found',404));
        // or
        // res.render("home")
      });


app.listen(port, () => { console.log('port used', port) });