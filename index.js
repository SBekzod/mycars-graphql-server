const {ApolloServer, gql} = require('apollo-server')
const express = require('express')

const db = {
    cars: [
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
}


// building SCHEMA
const schema = gql(` 
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
    CarsThroughAPI: Car
  }
   type Mutation {
    insertCar(brand: String!, color: String!, doors: Int!, type:CarTypes!): [Car]!
  }
`)

// building RESOLVERS
const resolvers = {
    Query: {
        carsByType: (parent, args, context, info) => {
            return context.db.cars.filter(car => car.type === args.type)
        },
        carsById: (parent, args, context, info) => {
            return context.db.cars.filter(car => car.id === args.id)[0]
        },
        CarsThroughAPI: async (parent, args, context, info) => {
            return await context.dataSources.carDataAPI.getCar()
        }
    },
    Mutation: {
        insertCar: (_, {brand, color, doors, type}, context) => {
            context.db.cars.push({
                id: Math.random().toString(),
                brand: brand,
                color: color,
                doors: doors,
                type: type
            })
            return context.db.cars
        }
    }
}

const dbConnection = () => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            return resolve(db)
        }, 100)
    })
}

// BUILDING APOLLO SERVER AND LISTENING TO IT
const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    dataSources: () => {
        return {
            carDataAPI: new CarDataAPI()
        }
    },
    context: async () => {
        return {db: await dbConnection()}
    }
})
server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`)
})



// INTERACT with API Calls
const {RESTDataSource} = require('apollo-datasource-rest')

class CarDataAPI extends RESTDataSource {
    async getCar() {
        const data = await this.get('http://localhost:3000/carData')
        return data
    }
}



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

app.listen(3000, function () {
    console.log('Listening to express server on 3000!')
})
