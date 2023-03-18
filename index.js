const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const startUp = require('./src/startup')
const routesHandler = require('./src/routes_handler')

app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(morgan('tiny'))
// all routes handler
routesHandler(app)
// start up
startUp(app)
