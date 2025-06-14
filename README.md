# LevelUP


# How to Switch to the `secondary` Branch (for Collaborators)

We have moved all active development to a new branch called `secondary`.  
If you forked/cloned the repo **before** the `secondary` branch existed, follow these steps **once** to get it into your fork and local setup.

---

## Steps to Fetch and Push the `secondary` Branch

1. Open your terminal and navigate to your local repo folder:
    ```bash
    cd your-forked-repo-folder
    ```

2. Add the original repository as a remote called `upstream` (only if not already added):
    ```bash
    git remote add upstream https://github.com/Dev-Joyson/LevelUP.git
    ```

3. Fetch all branches from the original repo:
    ```bash
    git fetch upstream
    ```

4. Create and switch to a new local branch `secondary` that tracks `upstream/secondary`:
    ```bash
    git checkout -b secondary upstream/secondary
    ```

5. Push the `secondary` branch to your own fork on GitHub:
    ```bash
    git push origin secondary
    ```

---

## After this

- You can now work on the `secondary` branch locally or on GitHub.
- Make sure to pull latest changes from `upstream/secondary` regularly.
- Open Pull Requests targeting the `secondary` branch on the original repo.

---

If you need any help, feel free to reach out!