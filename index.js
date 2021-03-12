const {graphql, buildSchema} = require("graphql")


// defining schemas for graphql
const schema = buildSchema(`
    type Query {
        message: String 
    }
`)

const resolvers = () => {
    const message = () => {
        return 'Hello World'
    }
    return {message}
}

// execute the query
const executeQuery = async () => {
    return await graphql(schema, '{message}', resolvers())
}
executeQuery().then(data => {
    console.log(data.data)
})
