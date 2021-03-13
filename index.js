const http = require('http')
const express = require('express')
const {graphql, buildSchema} = require('graphql')
const graphqlHTTP = require('express-graphql')
const cars =
    [
        {
            id: 'a',
            brand: 'Ford',
            color: 'Blue',
            doors: 4,
            type: 'Sedan'
        },
        {
            id: 'b',
            brand: 'Tesla',
            color: 'Red',
            doors: 4,
            type: 'SUV'
        },
        {
            id: 'c',
            brand: 'Toyota',
            color: 'White',
            doors: 4,
            type: 'Coupe'
        },
        {
            id: 'd',
            brand: 'Toyota',
            color: 'Red',
            doors: 4,
            type: 'Coupe'
        }
    ]


// GRAPHQL:SCHEMA creator
const schema = buildSchema(`
enum CarTypes {
   Sedan
   SUV
   Coupe
 }
 type Car {
     id: ID!
     brand: String!
     color: String!
     doors: Int!
     type: CarTypes!
  }
  type Query {
    carsByType(type:CarTypes!): [Car]
    carsById(id:ID!): Car
    carsBySomething(id:ID!): Car
  }
  type Mutation {
    insertCar(brand: String!, color: String!, doors: Int!, type:CarTypes!): [Car]!
  }
`)

// GRAPHQL:RESOLVERS creator
const resolvers = () => {

    const carsByType = args => {
        return cars.filter(car => car.type === args.type)
    }
    const carsById = args => {
        return cars.filter(car => car.id === args.id)[0]
    }
    const insertCar = ({brand, color, doors, type}) => {
        cars.push({
            id: Math.random().toString(),
            brand: brand,
            color: color,
            doors: doors,
            type: type
        })
        return cars
    }

    return {carsByType, carsById, insertCar}
}


// EXPRESS SERVER
const app = express()
app.use('/graphql',
    graphqlHTTP({schema: schema, rootValue: resolvers(), graphiql: true}))
app.use('/', function (req, res) {
    res.end('DONE: You are using server which is running with GraphQl')
})

const server = http.createServer(app)
server.listen(4000, function () {
    console.log('Express built with express-graphql is running on the port 4000!')
})





// Getting started the apollo server



