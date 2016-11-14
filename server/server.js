var express = require('express');
var app = express();
var server = require('http').createServer(app);
app.set('ip', "0.0.0.0");
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static('./app'));
app.set('appPath', './app');



server.listen(3000, function() {
  console.log("Listening 3000");
});
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/app/index.html");
});
var pg = require('pg');

var client = new pg.Client({
  user: 'postgres',
  password: 'postgres',
  database: 'ProjetBDD',
  host: '127.0.0.1',
  port: 5432
});

client.connect();

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/personneMusc', function(req, res) {
  var query = "select mail from personne where statut='Musicien';";
  client.query(query, function(err, result) {

    if (result.rowCount > 0) {
      res.status(200).json({
        mail: result.rows
      });
    } else {
      res.status(404).json({
        message: "Aucun Musicien inscrit"
      });
    }
  });
});

app.get('/styleMusique', function(req, res) {
  var query = "select style from style_musique;";
  client.query(query, function(err, result) {
    if (result.rowCount > 0) {
      res.status(200).json({
        style: result.rows
      });
    } else {
      res.status(404).json({
        message: "Aucun style de musique"
      });
    }
  });
});

app.get('/infoGroupe', function(req, res) {
  console.log(req.query);
  var query = "select g.nom_groupe, mg.mail from groupe g, membre_groupe mg where mg.nom_groupe=g.nom_groupe and g.nom_groupe='" + req.query.nom_groupe + "';";
  client.query(query, function(err, result) {
    if (result.rowCount > 0) {
      res.status(200).json({
        mail: result.rows
      });
    } else {
      res.status(404).json({
        message: "Aucun membre au groupe"
      });
    }
  });
});

app.get('/infoGroupeMusique', function(req, res) {
  var ladate = new Date();
  var query = "select m.titre,  m.nb_likes,  g.nom_groupe from groupe g, morceau m where g.nom_groupe=m.nom_groupe and g.nom_groupe='" + req.query.nom_groupe + "' and m.annee=" + ladate.getFullYear() + ";";
  client.query(query, function(err, result) {
    if (result.rowCount > 0) {
      res.status(200).json({
        morceau: result.rows
      });
    } else {
      res.status(404).json({
        message: "Aucun morceau pour ce groupe"
      });
    }
  });
});

app.get('/groupeEnComp', function(req, res) {
  var query = "select g.nom_groupe, AVG(age(p.date_naissance)) as moyenne_age, g.date_inscription from groupe g, membre_groupe m, personne p, annee_groupe a where g.nom_groupe=m.nom_groupe and p.mail=m.mail and a.nom_groupe=g.nom_groupe and a.annee=(SELECT date_part('year', now())) group by g.nom_groupe order by moyenne_age, g.date_inscription limit 15;";
  client.query(query, function(err, result) {
    if (result.rowCount > 0) {
      res.status(200).json({
        groupe: result.rows
      });
    } else {
      res.status(404).json({
        message: "Aucun groupe inscrit pour l'instant"
      });
    }
  });
});


app.get('/getnoteMusique', function(req, res) {
  var ladate = new Date();
  var query = "SELECT * FROM fiche_eval where mail='" + req.query.mail + "' and titre='" + req.query.titre + "' and nom_groupe='" + req.query.nom_groupe + "' and annee=" + ladate.getFullYear() + ";";

  client.query(query, function(err, result) {
    if (err) {
      res.status(404).json({
        message: "Erreur."
      });
    } else {
      res.status(200).json({
        note: result.rows
      });
    }
  });
});

app.post('/noteMusique', function(req, res) {
  var note = JSON.parse(req.query.note);
  var ladate = new Date();
  var query = "INSERT INTO fiche_eval(mail, titre, nom_groupe, annee, critere_1, critere_2, critere_3, " +
    "critere_4, critere_5, critere_6, critere_7, critere_8, critere_9, " +
    "critere_10, validation, date_creation_fiche, date_maj_fiche)" +
    " VALUES ('" + req.query.mail + "','" + req.query.titre + "', '" + req.query.nom_groupe + "', " + ladate.getFullYear() + "," + note.critere1 +
    ", " + note.critere2 + ", " + note.critere3 + ", " + note.critere4 + ", " + note.critere5 + "," + note.critere6 + ", " + note.critere7 + ", " + note.critere9 + ", " + note.critere9 + ", " + note.critere10 +
    ", true, now(), now());";

  client.query(query, function(err, result) {
    if (err) {
      res.status(404).json({
        message: "Problème pour ajouté la note."
      });
    } else {
      res.status(200).json({
        message: "La note de la musique a étais ajouté."
      });
    }
  });
});

app.post('/addMusique', function(req, res) {
  var ladate = new Date();
  console.log(req.query, ladate.getFullYear());
  var query = "INSERT INTO morceau(titre, nom_groupe, style, annee, nb_likes, date_creation_morceau, date_maj_morceau, gagnant)" +
    " VALUES ('" + req.query.titre + "', '" + req.query.nom_groupe + "','" + req.query.style + "', " + ladate.getFullYear() + ", 0, now(), now(), false);";
  client.query(query, function(err, result) {
    if (err) {
      res.status(404).json({
        message: "Problème pour ajouté la musique."
      });
    } else {
      res.status(200).json({
        message: "La musique a étais ajouté."
      });
    }
  });

});

app.post('/addGroupe', function(req, res) {
  var groupe = JSON.parse(req.query.groupe);
  var mails = req.query.mails;
  var querySelect = "SELECT * from adresse where ville='" + groupe.ville + "' and cp=" + groupe.codepostal;
  var query = "";
  client.query(querySelect, function(err, result) {

    if (result.rowCount === 1) {
      query = "INSERT INTO groupe(nom_groupe, insee, date_inscription, date_creation_groupe, date_maj_groupe)" +
        "VALUES ('" + groupe.nom + "', " + result.rows[0].insee + ", now(), now(), now());";
    } else {
      query = "INSERT INTO groupe(nom_groupe, insee, date_inscription, date_creation_groupe, date_maj_groupe)" +
        "VALUES ('" + groupe.nom + "', 29019, now(), now(), now());";
    }
    client.query(query, function(err, result) {
      if (err) {
        res.status(404).json({
          message: "Le nom de groupe est déjà utilisé."
        });
      } else {
        if (typeof(mails) === "object") {
          mails.forEach(function(m) {
            var queryMembre = "INSERT INTO membre_groupe(nom_groupe, mail) VALUES ('" + groupe.nom + "', '" + m + "');";
            client.query(queryMembre, function(err, result) {
              if (err) {
                res.status(404).json({
                  message: "Erreur dans l'inscription d'un membre au groupe."
                });
              }
            });
          });
        } else {
          var queryMembre = "INSERT INTO membre_groupe(nom_groupe, mail) VALUES ('" + groupe.nom + "', '" + mails + "');";
          client.query(queryMembre, function(err, result) {
            if (err) {
              res.status(404).json({
                message: "Erreur dans l'inscription d'un membre au groupe."
              });
            }
          });
        }
        var ladate = new Date();
        var query4 = "INSERT INTO annee_groupe(annee, nom_groupe) VALUES (" + ladate.getFullYear() + ", '" + groupe.nom + "');";
        client.query(query4, function(err, result) {
          if (err) {
            res.status(404).json({
              message: "Erreur insert annee_groupe."
            });
          }
        });
        res.status(200).json({
          message: "Groupe créé"
        });
      }
    });

  });
});

app.get('/info', function(req, res) {
  var query = "select p.nom, p.prenom, p.date_naissance, p.mail, p.sexe, p.statut, t.tel, a.ville, p.rue, p.numero_rue from personne p, telephone t, adresse a where a.insee=p.insee and p.mail=t.mail and p.mail='" + req.query.mail + "';";
  client.query(query, function(err, result) {
    if (result.rowCount === 1) {
      var query2 = "select mg.nom_groupe from membre_groupe mg, personne p where mg.mail=p.mail and p.mail='" + req.query.mail + "';";
      client.query(query2, function(err, resultGroupe) {
        if (resultGroupe.rowCount >= 1) {
          res.status(200).json({
            info_peronne: result.rows[0],
            info_groupe: resultGroupe.rows
          });
        } else {
          res.status(200).json({
            info_peronne: result.rows[0],
            info_groupe: "Pas de groupe"
          });
        }
      });
    } else {
      res.status(404).json({
        message: "L’e-mail entré ne correspond à aucun compte."
      });
    }

  });
});

app.get('/statistique', function(req, res) {
  var ladate = new Date();
  var query = "select m.titre, m.nom_groupe, m.annee, ROUND(avg(ROUND(ROUND((critere_1 + critere_2 + critere_3 + critere_4 + critere_5 + critere_6 + critere_7 + critere_8 + critere_9 + critere_10),2)/10,2)),2) as moyenne, m.nb_likes from fiche_eval e, morceau m where e.annee=" + ladate.getFullYear() + " and e.annee=m.annee and e.nom_groupe=m.nom_groupe and e.titre=m.titre and validation=true group by m.titre, m.nom_groupe, m.annee;";
  client.query(query, function(err, result) {
    res.status(200).json({
      statistique: result.rows
    });
  });
});

app.post('/connection', function(req, res) {

  var query = "SELECT * from personne where mail='" + req.query.mail + "'";

  client.query(query, function(err, result) {

    if (result.rowCount === 1) {
      if (result.rows[0].password === req.query.password) {
        res.status(200).json({
          message: "Connexion réussie"
        });
      } else {
        res.status(404).json({
          message: "Le mot de passe entré est incorrect."
        });
      }

    } else {
      res.status(404).json({
        message: "L’e-mail entré ne correspond à aucun compte."
      });
    }



  });
});

app.post('/inscription', function(req, res) {


  var querySelect = "SELECT * from adresse where ville='" + req.query.ville + "' and cp=" + req.query.cp;
  var query = "";
  client.query(querySelect, function(err, result) {
    if (result.rowCount === 1) {
      if (req.query.numrue === "") {
        query = "INSERT INTO personne(nom, prenom, date_naissance, mail, sexe, statut, insee, rue, password, salt_key, date_creation_personne, date_maj_personne) VALUES ('" + req.query.nom + "','" + req.query.prenom + "','" + req.query.age + "','" + req.query.mail + "','" + req.query.sexe + "','" + req.query.statut + "'," + result.rows[0].insee + ",'" + req.query.rue + "','" + req.query.password + "','" + req.query.password + "',now(),now());";
      } else {
        query = "INSERT INTO personne(nom, prenom, date_naissance, mail, sexe, statut, insee, numero_rue, rue, password, salt_key, date_creation_personne, date_maj_personne) VALUES ('" + req.query.nom + "','" + req.query.prenom + "','" + req.query.age + "','" + req.query.mail + "','" + req.query.sexe + "','" + req.query.statut + "'," + result.rows[0].insee + "," + req.query.numrue + ",'" + req.query.rue + "','" + req.query.password + "','" + req.query.password + "',now(),now());";
      }
    } else {
      if (req.query.numrue === "") {
        query = "INSERT INTO personne(nom, prenom, date_naissance, mail, sexe, statut, insee, rue, password, salt_key, date_creation_personne, date_maj_personne) VALUES ('" + req.query.nom + "','" + req.query.prenom + "','" + req.query.age + "','" + req.query.mail + "','" + req.query.sexe + "','" + req.query.statut + "',29019,'" + req.query.rue + "','" + req.query.password + "','" + req.query.password + "',now(),now());";
      } else {
        query = "INSERT INTO personne(nom, prenom, date_naissance, mail, sexe, statut, insee, numero_rue, rue, password, salt_key, date_creation_personne, date_maj_personne) VALUES ('" + req.query.nom + "','" + req.query.prenom + "','" + req.query.age + "','" + req.query.mail + "','" + req.query.sexe + "','" + req.query.statut + "',29019," + req.query.numrue + ",'" + req.query.rue + "','" + req.query.password + "','" + req.query.password + "',now(),now());";
      }
    }
    client.query(query, function(err, result) {
      if (err) {
        res.status(404).json({
          message: "L’e-mail entré est déjà utilisé."
        });
      } else {
        var queryTel = "INSERT INTO telephone(mail, tel)VALUES ('" + req.query.mail + "', '" + req.query.phone + "');"
        client.query(queryTel, function(err, result) {
          if (err) {
            res.status(404).json({
              message: "Le numéro de téléphone n'a pas été enregistré."
            });
          } else {
            if (req.query.statut === "Internaute") {
              var ladate = new Date();
              var queryAnnee = "INSERT INTO annee_personne(annee, mail, selection_jury) VALUES (" + ladate.getFullYear() + ",'" + req.query.mail + "' , false);";
              client.query(queryAnnee, function(err, result) {
                if (err) {
                  res.status(404).json({
                    message: "L'internaute est pas inscrit pour cette année."
                  });
                } else {
                  res.status(200).json({
                    message: "Inscription réussite"
                  });
                }
              });
            } else {
              res.status(200).json({
                message: "Inscription réussite"
              });
            }
          }
        });
      }
    });

  });
});
