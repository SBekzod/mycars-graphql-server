const { ApolloServer, gql } = require('apollo-server')
const {RESTDataSource} = require('apollo-datasource-rest')
const app = require('./app')

const cars = [
    {
        id: '1',
        brand: 'Toyota Corola',
        color: 'Blue',
        doors: 4,
        type: 'Sedan',
        parts: [{ id: '1' }, { id: '2' }]
    },
    {
        id: '2',
        brand: 'Toyota Camry',
        color: 'Red',
        doors: 4,
        type: 'SUV',
        parts: [{ id: '1' }, { id: '3' }]
    }
]
const parts = [
    {
        id: '1',
        name: 'Transmission',
        cars: [{ id: '1' }, { id: '2' }]
    },
    {
        id: '2',
        name: 'Suspension',
        cars: [{ id: '1' }]
    },
    {
        id: '3',
        name: 'Break',
        cars: [{ id: '2' }]
    }
]

// build SCHEMA
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
      parts:[Part]
    }
    type Part {
       id: ID!
       name: String
       cars: [Car]
    }
    type Cars {
      cars:[Car]
    }
    type APICar {
      id: ID!
      brand: String!
      color: String!
      doors: Int!
      type: CarTypes!
      parts:[Part]
    }
    
    type Query {
      carsByType(type:CarTypes!): [Car]
      carsById(id:ID!): Car
      partsById(id:ID!): Part
      carThroughAPI: APICar 
    }
    type Mutation {
      insertCar(brand: String!, color: String!, doors: Int!, type:CarTypes!): [Car]!
    }
`)

// build RESOLVERS
const resolvers = {
    Query: {
        carsById: (parent, args, context, info) => args,
        carsByType: (parent, args, context, info) => args,
        partsById: (parent, args, context, info) => args,
        carThroughAPI: async (parent, args, context, info) => {
            return await context.dataSources.carThroughAPI.getCar()
        }
    },
    Part: {
        name: (parent, args, context, info) => {
            if (context.parts.filter(part => part.id === parent.id)[0]) {
                return parts.filter(part => part.id === parent.id)[0].name
            }
            return null
        },
        cars: (parent, args, context, info) => {
            return context.parts.filter(part => part.id === parent.id)[0].cars
        }
    },
    Car: {
        brand: (parent, args, context, info) => {
            return context.cars.filter(car => car.id === parent.id)[0].brand
        },
        type: (parent, args, context, info) => {
            return context.cars.filter(car => car.id === parent.id)[0].type
        },
        color: (parent, args, context, info) => {
            return context.cars.filter(car => car.id === parent.id)[0].color
        },
        doors: (parent, args, context, info) => {
            return context.cars.filter(car => car.id === parent.id)[0].doors
        },
        parts: (parent, args, context, info) => {
            return context.cars.filter(car => car.id === parent.id)[0].parts
        }
    },
    Cars: {
        cars: (parent, args, context, info) => {
            return context.cars.filter(car => car.type === parent.type)
        }
    },
    Mutation: {
        insertCar: (_, {brand, color, doors, type}, context) => {
            context.cars.push({
                id: Math.random().toString(),
                brand: brand,
                color: color,
                doors: doors,
                type: type
            })
            return context.cars
        }
    }
}


const dbCarConnection = () => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            return resolve(cars)
        }, 100)
    })
}
const dbPartsConnection = () => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            return resolve(parts)
        }, 100)
    })
}

// APOLLO SERVER
const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    dataSources: () => {
        return {
            carThroughAPI: new CarDataAPI()
        }
    },
    context: async () => {
        return {cars: await dbCarConnection(), parts: await dbPartsConnection()}
    }
})
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})



// INTERACT with API Calls
class CarDataAPI extends RESTDataSource {
    async getCar() {
        const data = await this.get('http://localhost:3000/carData')
        return data
    }
}



// EXPRESS SERVER
app.listen(3000, function () {
    console.log('Listening to express server on 3000!')
})



