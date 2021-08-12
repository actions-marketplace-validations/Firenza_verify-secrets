# firenza/verify-secrets

If you use github secrets in your workflows use this action to verify all secrets are accessible to this repository via environment, organization, or repository defined secrets.

## Prerequisites
- This action requires a personal access token with admin rights to repo
- For Org level secrets personal access token must have org level admin rights

## Usage
```yml
- name: Verify Github Secrets
  uses: firenza/verify-github-secrets@v1
    with:
      access-token: ${{ secrets.PAT }}
      owner-and-repo: ${{ github.repository }}
      org: ${{ github.repository_owner }}
```

## Inputs
- `access-token`: (Required) Personal Access Token with repo admin rights, if under an org PAT requires Org and Repo admin rights

- `owner-and-repo`: (Required) Set to repository name (E.G. Firenza/verify-secrets)
  ```text
  ${{ github.repository }}
  ```
- `org`: (Optional) Only used if repo under org
  ```text
  ${{ github.repository_owner }}
  ```

## Debugging locally in VSCode

1. In the root of the respository run the following commands to setup the virtual environment
```
python3 -m venv .venv
source ./.venv/bin/activate  
pip3 install -r requirements.txt
```

1. Click the debug sidebar button
1. Click the green run button to the left of the dropdown with the `Python: Entry Point` text
