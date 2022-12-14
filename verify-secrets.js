const core = require('@actions/core');
const fs = require('fs');

verify_secrets = async function (secretsJson, secretNamesJson, exclusions) {

  if (!secretsJson && !secretNamesJson) {
    core.setFailed("You must provide either the 'secrets' or 'secret_names' inputs")
    return
  }

  if (secretsJson && secretNamesJson) {
    core.setFailed("You cannot provide both the 'secrets' and 'secret_names' inputs")
    return
  }

  let secretNames = new Set()

  if (secretsJson){
    const parsedSecrets = JSON.parse(secretsJson);

    for (var attributeName in parsedSecrets) {
      secretNames.add(attributeName);
    }
  }
  else{
    const parsedSecretNames = JSON.parse(secretNamesJson);

    for (var attributeName in parsedSecretNames) {
      secretNames.add(parsedSecretNames[attributeName]);
    }
  }

  core.info('Secrets available\n------------------------')
    
  for (const secretName of Array.from(secretNames).sort()) {
    core.info(secretName);
  }

  core.info('')

  let referencedSecretNames = new Set()

  const workflowFiles = await fs.promises.readdir(".github/workflows");

  for (const workflowFile of workflowFiles) {
    workflowFileBuffer = await fs.promises.readFile(`.github/workflows/${workflowFile}`);
    workflowFileContent = workflowFileBuffer.toString();

    const isReusableWorkflowRegex = /\:\s+workflow_call\:/g

    // Reusable workflows only use secrets passed to them so skip
    // parsing these files
    if (workflowFileContent.match(isReusableWorkflowRegex)) {
      core.info(`Skipping reusable workflow ${workflowFile}`)  
    }
    else{
      const secretRegex = /\{\{\s*secrets\.(.*?)\s*\}/g;
      let matches = [...workflowFileContent.matchAll(secretRegex)];
  
      for (const match of matches) {
        referencedSecretNames.add(match[1]);
      }
    }
  }

  core.info('\nSecrets referenced in workflows\n------------------------')
  
  for (const referencedSecretName of Array.from(referencedSecretNames).sort()) {
    core.info(referencedSecretName);
  }

  exclusion_secret_names = new Set()

  if (exclusions) {
    
    core.info('\nSecrets excluded from verification\n------------------------')
    
    exclusion_items = exclusions.split(',');

    for(const exclusion_item of exclusion_items){
      trimmed_exclusion_item = exclusion_item.trim();

      core.info(trimmed_exclusion_item);
      exclusion_secret_names.add(trimmed_exclusion_item);
    }
  }

  let missingSecretNames = new Set([...referencedSecretNames].filter(x => !secretNames.has(x)));
  // Filter out excluded secret names
  missingSecretNames = new Set([...missingSecretNames].filter(x => !exclusion_secret_names.has(x)));

  if (missingSecretNames.size > 0) {
    core.info('')

    for (const missingSecretName of Array.from(missingSecretNames).sort()) {
      core.error(`Secret "${missingSecretName}" is not defined`);
    }

    core.setFailed();
  }
};

module.exports = verify_secrets;