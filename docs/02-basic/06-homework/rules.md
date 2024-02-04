---
sidebar_position: 0
hide_table_of_contents: true
---

# Rules

The programming assignments adhere to specific guidelines, as highlighted below, for GitHub repositories, names, pull requests (PR), reviews and regular homework.

Guidelines for assignments:

- Create a dedicated GitHub repository for the homework.
- Your repository name **should** include the `-gear-academy` suffix, for example, `myname-gear-academy`.
- Exclude **build artifacts** such as `target`, `.binpath`, and editor files from the repository.
- **Enable** GitHub actions for your repository.
- **Submit** a homework as a pull request (PR) from a feature branch derived from the main branch.
- **Don't include** any unrelated changes in the PR.
- If any changes are requested, make updates **within the existing branch and PR**.
- PR **should** be merged to the main branch after the homework is accepted.
- **Do not** include any scaffolding code, private keys, or passwords in the PR.
- Ensure the tests and build process **pass** successfully.
- You **may** use `git` from the command line instead of relying on the GitHub web interface.

Add the following `.gitignore` file to your repo:

```text title=".gitignore"
target/
.binpath
```

Add the the following GitHub actions workflow `ci.yml` to the `.github/workflows` directory:

```yaml title=".github/workflows/ci.yml"
name: CI

on:
  pull_request:
    branches: [master]
  push:
    branches: [master]

env:
  CARGO_TERM_COLOR: always

jobs:
  ci:
    name: Run checks and tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown

      - name: Check and test
        run: |
          cargo fmt --all --check
          cargo clippy --all-targets -- -D warnings -A unused-imports
          cargo t
```
