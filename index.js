const core = require('@actions/core');
const updateFunctions = require('./update-function');

async function run() {
  try {
    // const stackname = core.getInput('stackname');
    const stackname = 'hcs-dev';

    if(!stackname) {
        throw Error('stackname must be defined!')
    }

    console.log(`Updating stack ${stackname}`)

    await updateFunctions(stackname)
  } catch (error) {
    console.error(error)
    core.setFailed(error.message);
  }
}

run();
