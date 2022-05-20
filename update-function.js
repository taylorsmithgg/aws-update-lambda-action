const { Lambda, paginateListFunctions, ListTagsCommand, UpdateFunctionCodeCommand} = require("@aws-sdk/client-lambda");

const client = new Lambda({region: 'us-west-2', retryMode: 'adaptive', maxAttempts: 100 })

// Get all functions
async function listFunctions() {
    const functions = []

    for await (const {Functions} of paginateListFunctions({client}, {})){
        const names = Functions.map((x) => {
            return x.FunctionArn
        })

        functions.push(...names)
    }

    // console.debug(`Found ${functions.length} functions`)

    return functions
}

// Get all tags
async function listTags(){
    const functions = await listFunctions()

    return Promise.all(
        functions
            .map(async (arn) => {
                const {Tags} = await client.send(new ListTagsCommand({Resource: arn}))

                return {tags: Tags, arn}
            })
    )
}

// Filter tags for stackName
async function filterTags(stackName){
    const tags = await listTags()

    return tags
            .filter((result) => {
                return Object.values(result.tags).indexOf(stackName) > -1
            })
}

// Update function code
async function updateFunctions(stackName){
    const filteredTags = await filterTags(stackName)

    return Promise.all(
        filteredTags
            .map(async ({arn}) => {
                const {} = await client.send(new UpdateFunctionCodeCommand({
                    FunctionName: arn,
                    ImageUri: `422025336571.dkr.ecr.us-west-2.amazonaws.com/govyrl/${stackName.split('-dev')[0]}-${arn.split(':')[6].split('-dev')[0]}:latest`
                }))

                return {arn}
            })
    )
}

module.exports = updateFunctions

// (async ()=>{
//     console.log(`Updating stack: ${process.argv[2]}`)
//     const tags = await updateFunctions()
//     console.log(JSON.stringify(tags, null , 2))
// })();