const express = require('express')
const app = express()
const axios = require('axios')
const cheerio = require('cheerio')

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'

const singerArr = []

app.get('/', async (req, res) => { //necesito hacer la peticion get asincrona para el segundo axios
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            
            const indexLinks = [];
            $('#mw-pages a').each((index, element) => {
                const indexlink = $(element).attr('href');
                indexLinks.push(`https://es.wikipedia.org${indexlink}`);
            });

            for (let i = 0; i < indexLinks.length; i++) { //utilizo un bucle for para asignar el valor de i a una key index en cada objeto
                const link = indexLinks[i]
                try {
                    const response = await axios.get(link);
                    const html = response.data;
                    const $ = cheerio.load(html);

                    
                    const name = $('h1').text()
                    const description = $('p').text()
                    const imgSrc = $('span a img').attr('src')
                    const imgFullSrc = `https:${imgSrc}`
                    const singer = {
                        index: i, //key para utilizar a la hora de generar rutas dinamicas automaticamente
                        name: name,
                        description: description,
                        img: imgFullSrc
                    }
                    singerArr.push(singer)
                    console.log(singerArr) // saca por consola el array de objetos con los datos requeridos en el challenge
                    
                } catch (error) {
                    console.error(`Error al obtener los datos del enlace ${link}:`, error);
                }
            }
        }
    } catch (error) {
        console.error(`Error al obtener la página principal:`, error);
    }

    res.send(`
        <ul>
            ${singerArr.map(singer => `<li><a href ="/cantantes/${singer.index}">${singer.name}</a></li>`).join('')}
        </ul>
        `)
});

//rutas dinamicas para cada cantante utilizando index como parametro en la URL
app.get('/cantantes/:index', (req, res) => {
    const index = parseInt(req.params.index, 10) //convierto index a un numero entero binario ya que se captura como cadena

    if (index >= 0 && index < singerArr.length) { //verificacion de que el index esta entre los valores correctos
        const singer = singerArr[index]
        res.send(`
            <h1>${singer.name}</h1>
            <p>${singer.description}</p>
            <img src="${singer.imgFullSrc}" alt="${singer.name}">
            `)
    }
})


app.listen(3000, () => {
    console.log('server escuchando en puerto: http://localhost:3000')
})


