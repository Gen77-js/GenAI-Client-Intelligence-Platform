import os
import sys
import subprocess
import shutil

def run_cmd(cmd, cwd=None):
    print(f"\n> Running: {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd)
    if res.returncode != 0:
        print(f"Command failed with exit code {res.returncode}")
        return False
    return True

def deploy():
    print("==================================================")
    print("      GenAI Client Intelligence Platform          ")
    print("            Deployment Automation                 ")
    print("==================================================")
    
    # 1. Hugging Face Deployment (Backend)
    print("\n--- Step 1: Hugging Face Deployment (Backend) ---")
    print("To deploy the backend, we will create a Space with a Docker environment on Hugging Face.")
    hf_token = input("Enter your Hugging Face WRITE access token: ").strip()
    if not hf_token:
        print("Error: Hugging Face write token is required to deploy the backend!")
        return

    try:
        from huggingface_hub import HfApi
    except ImportError:
        print("huggingface_hub library not found. Installing now...")
        if not run_cmd("pip install huggingface_hub"):
            return
        from huggingface_hub import HfApi

    api = HfApi(token=hf_token)
    try:
        user_info = api.whoami()
        username = user_info['name']
        print(f"Successfully authenticated as Hugging Face user: {username}")
    except Exception as e:
        print(f"Hugging Face Authentication failed: {e}")
        return

    space_name = input("Enter a name for your new Hugging Face Space (e.g. client-intelligence-backend): ").strip()
    if not space_name:
        print("Error: Space name cannot be empty.")
        return

    repo_id = f"{username}/{space_name}"
    print(f"Initializing Space: {repo_id}...")
    try:
        api.create_repo(repo_id=repo_id, repo_type="space", space_sdk="docker", private=False)
        print("Space created successfully!")
    except Exception as e:
        if "already exists" in str(e):
            print("Space already exists. Proceeding to update files.")
        else:
            print(f"Could not create space: {e}")
            return

    # Set Groq API key secret on Space
    groq_key = input("Enter your GROQ_API_KEY (to be set securely as a space secret): ").strip()
    if groq_key:
        try:
            api.add_space_secret(repo_id=repo_id, key="GROQ_API_KEY", value=groq_key)
            print("GROQ_API_KEY successfully configured in Hugging Face Space secrets.")
        except Exception as e:
            print(f"Failed to set Space secret: {e}")
    else:
        print("Skipping GROQ_API_KEY setup. You will need to add it manually in Space settings.")

    # Upload backend files to Space
    print("Uploading backend files to Hugging Face Space...")
    try:
        api.upload_folder(
            folder_path="backend",
            repo_id=repo_id,
            repo_type="space",
            ignore_patterns=["venv*", "__pycache__*", "*.env"]
        )
        print("Backend uploaded and building on Hugging Face Spaces!")
    except Exception as e:
        print(f"Failed to upload files: {e}")
        return

    # Hugging Face Space Direct API endpoint
    hf_space_url = f"https://{username}-{space_name.lower().replace('_', '-').replace('.', '-')}.hf.space"
    print(f"Backend API URL: {hf_space_url}")

    # 2. Vercel Deployment (Frontend)
    print("\n--- Step 2: Vercel Deployment (Frontend) ---")
    print("We will now deploy the React + Vite frontend to Vercel.")
    print("If you are not logged in to Vercel, the CLI will open a browser to authenticate.")
    if not run_cmd("npx vercel login"):
        print("Failed to authenticate with Vercel CLI.")
        return

    # Set Vite environment variable
    fe_env_path = "frontend/.env.production"
    print(f"Setting production API URL: {hf_space_url}")
    with open(fe_env_path, "w") as f:
        f.write(f"VITE_API_URL={hf_space_url}\n")

    print("Deploying frontend to Vercel...")
    # Deploy to Vercel production
    if not run_cmd("npx vercel --prod", cwd="frontend"):
        print("Vercel deployment failed.")
        return

    # 3. Git Repository Push
    print("\n--- Step 3: Git Remote Push ---")
    git_remote = input("Enter your GitHub/GitLab remote repository URL (leave blank to skip): ").strip()
    if git_remote:
        # Check if remote already exists
        res = subprocess.run("git remote", shell=True, capture_output=True, text=True)
        if "origin" in res.stdout:
            run_cmd(f"git remote set-url origin {git_remote}")
        else:
            run_cmd(f"git remote add origin {git_remote}")
        
        run_cmd("git branch -M main")
        print("Pushing to remote repository...")
        if run_cmd("git push -u origin main"):
            print("Successfully pushed to git remote!")
        else:
            # Fallback to master if main push fails
            run_cmd("git push -u origin master")
    else:
        print("Skipping Git push.")

    print("\n==================================================")
    print("🎉 DEPLOYMENT STEPS COMPLETED!")
    print(f"Backend (Hugging Face Space): {hf_space_url}")
    print("Frontend: Check the Vercel terminal output URL above.")
    print("==================================================")

if __name__ == "__main__":
    deploy()
