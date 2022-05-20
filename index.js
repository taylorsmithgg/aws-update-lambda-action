const core = require('@actions/core');
const updateFunctions = require('./update-function');

async function run() {
  try {
    // const ms = core.getInput('milliseconds');
    // core.info(`Waiting ${ms} milliseconds ...`);

    // core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    // await wait(parseInt(ms));
    // core.info((new Date()).toTimeString());

    // core.setOutput('time', new Date().toTimeString());
    const stackname = core.getInput('stackname');

    if(!stackname) {
        throw Error('stackname must be defined!')
    }

    console.log(`Updating stack ${stackname}`)

    await updateFunctions(stackname)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
