const {graphql, buildSchema} = require("graphql")


// defining schemas for graphql
const schema = buildSchema(`
    type Query {
        message: String 
        greetings(name: String): String
    } 
    
`)

const resolvers = function () {
    const message = () => {
        return 'Hello World'
    }
    const greetings = (args) => {
        return `Hello Mr.${args.name}`
    }
    return {message, greetings}
}

// execute the query
let instance = "John"
const executeQuery = async () => {
    return await graphql(schema, `{ greetings(name: "${instance}")}`, resolvers())
}
executeQuery().then(data => {
    console.log(data.data)
})

