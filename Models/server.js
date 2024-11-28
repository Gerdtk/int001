
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');


class Server{
    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.middlewares();
        this.routes();
        this.listen();
        // this.conectarBd();

    }
    /* conectarBd(){
        this.con = mysql.createPool({
            host: "localhost",
            user: "root",
            password: "Sitio123",
            database: "usuarios"
        }); 
    } */
    middlewares(){
        this.app.use(express.static('./public'));
        this.app.use(express.json());
        this.app.use(express.urlencoded());
        this.app.set("view engine","ejs");
        this.app.set("trust proxy");
        this.app.use(session({ 
            secret: 'clave',
            resave: false,
            saveUninnitialized: true,
            cookie:{ secure:false}
        }));
    }
    routes(){
        this.app.get('/why',(req, res) => {
            let usuario = req.session.user;
            let rol = req.session.rol
            if(req.session.user){
                if(req.session.rol == "administrador"){
                    res.render('why', {Usuario: usuario, rol: rol})
                }
                else if(req.session.rol == "general"){
                    res.render('why', {Usuario: usuario, rol: rol})
                }
            }else{res.render('errori', {mensaje:"no se inicio secion"});}
        });
        this.app.get("/hola" , (req,res) => { 
            if(req.session.user){
                res.send("hellow " + req.session.user);
            } else{
                res.send("no se inicio secion correctamente"); //registro y comprobacion de usuarios
            };
        });
        this.app.post("/consultar", (req,res)=> {
            res.render('consular');
        });
        this.app.post("/login", (req, res) => {
            let user = req.body.usuario;
            let pass = req.body.Cont;

            console.log(user);
            console.log(pass);
           
                this.con.query("SELECT * FROM ingreso WHERE nombre='"+ user + "'", (err, results, fields) => {
                    if (err) throw err;
                    if (results.length > 0){
                        if (bcrypt.compareSync(pass, results[0].cont)){
                            console.log('credenciales correctas');
                            req.session.user = user;
                            req.session.rol = results[0].rol;
                            res.render("index", {usuario:user, rol:"admin"});// creacion de sesciones que guarda el cliente en una cookie
                            
                            
                        }else{
                            console.log("contraseña incorrecta");
                            res.render('errori',{mensaje:"usuario o contrase;a incorrecta"});
                        }
                    }else{
                        console.log("usuario no existe");
                        res.render('errori', {mensaje:"usuario o contrasea incorrecta"});
                    }
                });
            });
        
        this.app.post('/registrar', (req, res) => {
                let user = req.body.usuario;
                let cont = req.body.cont;//cifrar contraseña con bcrypt
                let salt =bcrypt.genSaltSync(12);
                let hashedCont = bcrypt.hashSync(cont, salt);
                console.log(cont);
                let datos = [user, hashedCont, "general"];  
                let sql = "INSERT INTO ingreso Values (?,?,?)";
                this.con.query(sql, datos, (err, results) => {
                    if(err) throw err;
                    console.log("usuario guardado ...");
                    //res.send("usuario guardaddo...")
                    res.redirect("/login.html");
                })

            });  //res.render("inicio", {usuario:user, rol:rols});
            //res.send();
        };// se repite la funcion callback, para el requeriminto del usuario(req) y su respuesta(res)
       
    
    listen() {
        this.app.listen(this.port, ()=>{
            console.log("servidor escuchando:http://127.0.0.1:" + this.port);
        });
    }

}
module.exports = Server;
