const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fs = require("fs");
const moment = require('moment-timezone');

// Inicialize o Firebase
const serviceAccount = require("./env.json"); // substitua pelo caminho para o seu arquivo de chave privada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();

app.use(bodyParser.json());

// Middleware para parsear JSON
app.use(bodyParser.json());

function formatDate(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0"); //Os meses são de 0 a 11, então adicionamos 1
  const ano = date.getFullYear();
  return moment(date).tz('America/Sao_Paulo').format('DD-MM-YYYY');
}
function formatTime(date) {
  const hrs = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return moment(date).tz('America/Sao_Paulo').format('HH:mm:ss');
}

app.post("/data", (req, res) => {
  const temperatura = req.body.temperatura;
  const umidade = req.body.umidade;

  const dataHoraAtual = new Date();

  const data = {
    dataHora: `${formatDate(dataHoraAtual)} - ${formatTime(dataHoraAtual)}`,
    temperatura: temperatura,
    umidade: umidade,
  };

  // Sempre vamos adicionar os dados ao mesmo documento "dados"
  const docRef = db.collection("comfort").doc("dados");

  docRef
    .update({
      entradas: admin.firestore.FieldValue.arrayUnion(data),
    })
    .then(() => {
      res.status(200).send("Dados recebidos e gravados com sucesso!");
    })
    .catch((error) => {
      // Se o documento não existir, este código irá criar o documento e adicionar os primeiros dados
      if (error.message.includes('No document to update')) {
        docRef.set({
          entradas: [data],
        }).then(() => {
          res.status(200).send("Dados recebidos e gravados com sucesso!");
        }).catch((error) => {
          console.error("Erro ao gravar os dados no Firestore:", error);
          res.status(500).send("Ocorreu um erro ao gravar os dados no Firestore.");
        });
      } else {
        console.error("Erro ao gravar os dados no Firestore:", error);
        res.status(500).send("Ocorreu um erro ao gravar os dados no Firestore.");
      }
    });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});