# LevelUP



# Update After Deletion of `secondary` Branch

The `secondary` branch has been deleted from the original repository.  
If you had the `secondary` branch locally or on your fork, please follow these steps to clean up and stay in sync.

---

## Steps for Collaborators

1. **Delete your local `secondary` branch (optional but recommended):**

    ```bash
    git branch -d secondary
    ```

    If you get an error about unmerged changes, force delete it:

    ```bash
    git branch -D secondary
    ```

2. **Delete the `secondary` branch from your fork on GitHub (optional but recommended):**

    - Via GitHub website:  
      Go to your fork → Branches tab → find `secondary` → click the trash icon to delete.

    - Or via terminal:

    ```bash
    git push origin --delete secondary
    ```

3. **Fetch and update your local repository with the latest from the original repo:**

    ```bash
    git fetch upstream
    git checkout main
    git merge upstream/main
    git push origin main
    ```

4. **Switch to the `main` branch or a new development branch as instructed by the maintainer:**

    If development will continue on `main`, use:

    ```bash
    git checkout main
    ```

    If a new branch is created to replace `secondary`, fetch and switch to it:

    ```bash
    git fetch upstream
    git checkout -b new-branch-name upstream/new-branch-name
    git push origin new-branch-name
    ```

---

## Summary

| Action                         | Command / How to do it                             |
|-------------------------------|---------------------------------------------------|
| Delete local `secondary` branch | `git branch -d secondary` (or `-D` if needed)      |
| Delete fork's `secondary` branch | GitHub web UI or `git push origin --delete secondary` |
| Sync fork with original repo    | `git fetch upstream && git merge upstream/main`   |
| Switch to active dev branch     | `git checkout main` or `git checkout -b <branch>` |

---

If you have any questions or need help, feel free to reach out!