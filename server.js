var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
app.use(express.static('./Public'));
var shortid = require('shortid')
var uuid = require('uuid-js')
app.use(bodyParser.urlencoded({ extended: true }));
var io = require('socket.io')(http);
var dataid;
var camid;
var mongo = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";
var val


require('events').EventEmitter.prototype._maxListeners = 100;

http.listen(process.env.PORT || 3000);

//website part


var path = __dirname + '/Public/login.html'

app.all('/',function(req,res){
    res.sendFile(path)
})
app.get('/logout',function(req,res){
res.redirect('/login.html');
})
app.post('/login',function(req,res){
    var name = req.body.username;
    var pwd = req.body.password;
    if (name=="admin" && pwd=="admin" )
    {
        res.redirect('http://localhost:3000/dashboard_admin.html')
    }



})

app.get('/courses',function(req,res){
    res.redirect("http://localhost:3000/courses.html")
})

app.get('/subject/:query',function(req,res){
    console.log("back end request")
    var name = req.params.query
    console.log(name)
    res.redirect("http://localhost:3000/subject.html")
})


app.post('/action',function(req,res){
    console.log(req.body)
})




















    

    

































































