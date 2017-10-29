var express = require('express');
var multer = require('multer')
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
var url = "mongodb://localhost:27017/professor";
var upload = multer({ dest: 'uploads/' })
var val
var mime = require('mime-types')
var crypto = require('crypto')
const Base64File=require('js-base64-file');
const image=new Base64File;

var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)
if(file!=undefined)
      cb(null, file.originalname)
    })
  }
})

var upload = multer({ storage: storage })

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
    else if (name=="teacher" && pwd=="teacher" )
    {
        res.redirect('http://localhost:3000/teacher.html')
    }



})

app.get('/teacher/:query',function(req,res){
    var sub = req.params.query
    console.log(sub)
    res.sendFile(__dirname+"/Public/send_msg.html")
})

app.post('/teacher/:query',upload.single('datafile'),function(req,res,next){
    var message = req.body.confirmationText;
    var scode=req.body.code;
    var filename = req.body.datafile;
    console.log(req.file)
    if(req.file!=undefined)
    {
                const filena =req.file.originalname;
        const pa=`${__dirname}/`+"uploads/";
         data=image.loadSync(pa,filena);
         fname = req.file.originalname


    }
    else{
         data=null
         fname=null
    }

        //console.log(data)
        //setTimeout(enter,1000)
        //function enter()
       // {
    var entry ={
        message:message,
        sub_code:scode,
        time: new Date(),
        file:data,
        filename:fname
        
    }
        mongo.connect(url,function(err,db){
        console.log('inside mongo');
         db.collection('entries').insertOne(entry,function(err,result){
             if(err)
             {
                 console.log(err)
             }
             else{
                  res.sendFile(__dirname+"/Public/send_msg.html");
             }

         })

     })
        //}

     
})

app.get('/courses',function(req,res){
    res.redirect("http://localhost:3000/courses.html")
})

app.get('/subject/:query',function(req,res){
    var entries = []
    var subject = req.params.query
        mongo.connect(url,function(err,db){
        console.log('inside mongo');
         db.collection('entries').find({"sub_code":subject},function(err,results){
             if(err)
             {
                 console.log(err)
             }
             else{
                  results.forEach(function(doc,err){
                      entries.push(doc)
                  })
         console.log(entries)
                  nsp = io.of('/'+subject)
                  nsp.on('connection',function(socket){
                      nsp.emit(subject,entries)
                  })
             }

         })

     })

    console.log("back end request")
    var name = req.params.query
    console.log(name)
    res.sendFile(__dirname+"/Public/subject.html")
})


app.post('/action',function(req,res){
    console.log(req.body)
})





















    

    

































































