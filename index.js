const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');

const app = express();
app.use(bodyParser.json()); // para suportar o JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // para suportar URL-encoded bodies

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Data');

// Adiciona os cabeçalhos
worksheet.columns = [
    { header: 'Temperatura', key: 'temperatura', width: 10 },
    { header: 'Umidade', key: 'umidade', width: 10 }
];

app.post('/data', (req, res) => {
    const temperatura = req.body.temperatura;
    const umidade = req.body.umidade;

    // Adiciona uma nova linha ao arquivo Excel
    worksheet.addRow({ temperatura, umidade });

    // Salva o arquivo
    workbook.xlsx.writeFile('dados.xlsx')
        .then(() => {
            console.log('Dados salvos com sucesso no arquivo Excel.');
        })
        .catch((err) => {
            console.error('Erro ao salvar o arquivo Excel:', err);
        });

    res.status(200).send('Dados recebidos com sucesso!');
});

app.listen(3000, () => {
    console.log('Server rodando na porta 3000');
});