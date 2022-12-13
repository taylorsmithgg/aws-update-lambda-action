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

    if(filteredTags.length < 1){
        throw Error(`No functions found for stack: ${stackName}`)
    }

    const {AWS_ROLE_ARN, AWS_REGION} = process.env;

    const AWS_ACCOUNT = AWS_ROLE_ARN.split(':')[4]

    const imageUriPrefix = `${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/govyrl/`

    return Promise.all(
        filteredTags
            .map(async ({arn, tags}) => {
                const {} = await client.send(new UpdateFunctionCodeCommand({
                    FunctionName: arn,
                    ImageUri: `${imageUriPrefix}${tags['Name'].split('-dev')[0]}:latest`
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