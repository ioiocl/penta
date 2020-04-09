const jp = require('jsonpath');
const fs = require('fs');
const convert = require('xml-js');
const express = require("express");
const app = express();
app.use(express.static(__dirname + '/public')); 


app.get('/api/data', function (req, res) {

    let listInvoices = [];

    for (let i=1; i < 6; i++){
        let invoice = {}
        let xml = fs.readFileSync('dte-'+ i +'.xml', 'utf8')
        let xmlJson = convert.xml2json(xml, {compact: true, spaces: 4});
    
        let emisor = jp.query(JSON.parse(xmlJson), '$..emisor');
        invoice.emisor = emisor[0]._attributes;
    
        let receptor = jp.query(JSON.parse(xmlJson), '$..receptor');
        invoice.receptor = receptor[0]._attributes;
    
        let fechaEmision = jp.query(JSON.parse(xmlJson), '$..emision');
        let fechaEmisionDate = new Date(fechaEmision * 1000);
        let tipo = jp.query(JSON.parse(xmlJson), '$..tipo');
        let folio = jp.query(JSON.parse(xmlJson), '$..folio');
    
        invoice.timestamp = Number(fechaEmision.pop())
        invoice.fechaEmision = fechaEmisionDate
        invoice.tipo =  tipo.pop()
        invoice.folio =  folio.pop()
    
        let monto = jp.query(JSON.parse(xmlJson), '$..monto');
        let iva = jp.query(JSON.parse(xmlJson), '$..iva');
        let totalNeto = 0;
        let totalBruto = 0;
        for (let j=0; j < monto.length; j++){
            totalNeto += Number(monto[0]) + Number(iva[0])
            totalBruto += Number(monto[0])
        }
    
        invoice.totalNeto = totalNeto;
        invoice.totalBruto = totalNeto;
    
        listInvoices.push(invoice)
    
    }
    
    
    listInvoices.sort(function(a, b){return b.fechaEmision-a.fechaEmision});

    res.send(listInvoices);
  });


app.listen(3000, () => {
 console.log("El servidor está inicializado en el puerto 3000");
});






