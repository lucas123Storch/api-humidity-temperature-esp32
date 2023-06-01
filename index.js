const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fs = require("fs");

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
  return `${dia}-${mes}-${ano}`;
}
function formatTime(date) {
  const hrs = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return `${hrs}:${min}:${sec}`;
}

app.post("/data", (req, res) => {
  // Acessar os dados enviados pela ESP8266
  const temperatura = req.body.temperatura;
  const umidade = req.body.umidade;

  // Fazer algo com os dados recebidos (por exemplo, salvá-los em um banco de dados ou arquivo)
  // console.log(`Temperatura: ${temperatura}, Umidade: ${umidade}`);

  // Obter a data e hora atual
  const dataHoraAtual = new Date();
  const dataAtual = new Date();

  // Gravar os dados no Firestore
  const data = {
    dataHora: `${formatDate(dataHoraAtual)} - ${formatTime(dataHoraAtual)}`,
    temperatura: temperatura,
    umidade: umidade,
  };

  const docRef = db.collection("comfort").doc(formatDate(dataAtual));

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        // Se o documento já existe, adicionar a nova leitura ao array "entradas"
        return docRef.update({
          entradas: admin.firestore.FieldValue.arrayUnion(data),
        });
      } else {
        // Se o documento não existe, criar um novo com a primeira leitura no array "entradas"
        return docRef.set({
          entradas: [data],
        });
      }
    })
    .then(() => {
      res.status(200).send("Dados recebidos e gravados com sucesso!");
    })
    .catch((error) => {
      console.error("Erro ao gravar os dados no Firestore:", error);
      res.status(500).send("Ocorreu um erro ao gravar os dados no Firestore.");
    });
  // // Gravar os dados em um arquivo
  // const data = `${formatTime(dataHoraAtual)} - Temperatura: ${temperatura}, Umidade: ${umidade}\n`;
  // fs.appendFile('dados.txt', data, (err) => {
  //   if (err) {
  //     console.error('Erro ao gravar os dados no arquivo:', err);
  //     res.status(500).send('Ocorreu um erro ao gravar os dados no arquivo.');
  //     return;
  //   }

  // res.status(200).send('Dados recebidos e gravados com sucesso!');
  // });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});