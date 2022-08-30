const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

const port = process.env.port || 5000;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


//Connection pool

const pool = mysql.createPool({
    connectionLimit:10,
    host:'localhost',
    user:'root',
    password:'',
    database:'api-tutorial',
});

// get method

app.get('/members',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) console.log(err);
        console.log('Connection id is',err);

        connection.query('SELECT  * FROM members',(err,rows)=>{
            if(!err){
                res.send(rows);
            }
            else{
                console.log(err);
            }
        });
    })
});
// Get particular data
app.get('/members/:id',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) console.log(err);
        console.log('Connection id is',err);

        connection.query('SELECT  * FROM members WHERE ID = ?',[req.params.id],(err,rows)=>{
            if(!err){
                res.send(rows);
            }
            else{
                console.log(err);
            }
        });
    })
});
// Delete query
app.delete('/members/delete/:id',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) console.log(err);
        console.log('Connection id is',err);

        connection.query('DELETE FROM members WHERE ID = ?',[req.params.id],(err,rows)=>{
            if(!err){
                res.send('The record has been deleted with ID'+([req.params.id]));
            }
            else{
                console.log(err);
            }
        });
    })
});
app.post('/members/add/',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) console.log(err);
        console.log('Connection id is',err);
        const params = req.body;
        connection.query('INSERT INTO members SET ?',[params],(err,rows)=>{
            if(!err){
                res.send('The record has been inserted with name');
            }
            else{
                console.log(err);
            }
        });
    })
});

app.put('/members/update',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) console.log(err);
        console.log('Connection id is',err);
      //  const params = req.body;
        const {id, name,email} = req.body;
        connection.query('UPDATE members SET name = ? ,email = ? WHERE id = ?',[name,email,id],(err,rows)=>{
            if(!err){
                res.send('The record has been update with id');
            }
            else{
                console.log(err);
            }
        });
    })
});


app.listen(port,()=>{console.log('port used',port)});