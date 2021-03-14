const express = require('express')

// BUILDING EXPRESS SERVER AND LISTENING TO IT
const app = express()
app.get('/carData', function (req, res) {
    res.json({
        id: "x",
        brand: "Mustang",
        color: "yellow",
        doors: 2,
        type: "Coupe"
    })
})

module.exports = app
