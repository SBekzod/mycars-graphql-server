const { ApolloServer, gql } = require('apollo-server')
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools')
const { merge } = require('lodash')

// create a memory db
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

// build SCHEMAS
const carEnum = `
    enum CarTypes {
      Sedan
      SUV
      Coupe
    }
`
const carType = `
     type Car {
      id: ID!
      brand: String!
      color: String!
      doors: Int!
      type: CarTypes!
    }
`

const carQueries = `
  type Query {
    carsById(id:ID!): Car
    carsByType(type:CarTypes!): [Car]
  }

  type Mutation {
    insertCar(brand: String!, color: String!, doors: Int!, type:CarTypes!): [Car]!
  }
`

// build RESOLVERS
const carResolversQueries = {
    Query: {
        carsByType: (parent, args, context, info) => {
            return db.cars.filter(car => car.type === args.type)
        },
        carsById: (parent, args, context, info) => {
            return db.cars.filter(car => car.id === args.id)[0]
        }
    }
}
const carResolversMutations = {
    Mutation: {
        insertCar: (_, { brand, color, doors, type }) => {
            db.cars.push({
                id: Math.random().toString(),
                brand: brand,
                color: color,
                doors: doors,
                type: type
            })
            return db.cars
        }
    }
}
const dealership = `
    type Dealership {
      name: String
      city: String
    }
    type Query{
      dealership: Dealership
    }
`
const dealershipResolvers = {
    Query: {
        dealership: (parent, args, context, info) => {
            return {
                name: 'Honda',
                city: 'Calgary'
            }
        }
    }
}


// APOLLO MERGING
const carsSchema = makeExecutableSchema({
    typeDefs: [carQueries, carEnum, carType],
    resolvers: merge(carResolversMutations, carResolversQueries)
})
const dealershipSchema = makeExecutableSchema({
    typeDefs: [dealership],
    resolvers: dealershipResolvers
})
const mergedSchema = mergeSchemas({
    schemas: [carsSchema, dealershipSchema]
})


// APOLLO SERVER
const server = new ApolloServer({
    schema: mergedSchema
})
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})