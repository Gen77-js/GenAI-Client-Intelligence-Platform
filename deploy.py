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
    
    # 1. Authenticate Vercel
    print("\n--- Step 1: Vercel Authentication ---")
    print("If you are not logged in to Vercel, the CLI will open a browser to authenticate.")
    if not run_cmd("npx vercel login"):
        print("Failed to authenticate with Vercel CLI.")
        return

    # 2. Deploy Backend to Vercel
    print("\n--- Step 2: Deploy Backend to Vercel ---")
    print("We will deploy the Python FastAPI backend to Vercel as a Serverless function (FREE).")
    
    # We will trigger the initial deployment to link the project
    print("\nStaging initial backend deployment to link the project. Answer the Vercel prompts:")
    print("- Set up and deploy: Yes")
    print("- Which scope: (Select your account)")
    print("- Link to existing project: No")
    print("- What name: (Press Enter to keep default 'backend')")
    print("- In which directory is your code located: ./")
    print("- Modify settings: No")
    
    if not run_cmd("npx vercel --prod", cwd="backend"):
        print("Backend deployment failed.")
        return

    print("\nBackend deployment successful!")
    backend_url = input("Enter the deployed Vercel backend URL (copy the 'Production' URL from above, e.g. https://xxx.vercel.app): ").strip()
    if not backend_url:
        print("Error: Backend URL is required to configure the frontend.")
        return

    # Add GROQ_API_KEY environment variable to Vercel backend
    groq_key = input("\nEnter your GROQ_API_KEY (to be set securely as a project secret on Vercel): ").strip()
    if groq_key:
        print("Saving GROQ_API_KEY to Vercel...")
        # Vercel env add GROQ_API_KEY production
        # We run the command and pass the secret through stdin
        p = subprocess.Popen("npx vercel env add GROQ_API_KEY production", shell=True, cwd="backend", stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = p.communicate(input=groq_key + "\n")
        print(stdout)
        if p.returncode != 0:
            print(f"Warning: could not add environment variable via CLI: {stderr}")
            print("Please add the GROQ_API_KEY manually in your Vercel project dashboard under Settings -> Environment Variables.")
        else:
            print("GROQ_API_KEY set successfully on Vercel.")
            # Redeploy to apply changes
            print("Redeploying backend to apply the environment variable...")
            run_cmd("npx vercel --prod", cwd="backend")
    else:
        print("Skipping GROQ_API_KEY setup. Remember to add it manually in your Vercel Dashboard.")

    # 3. Deploy Frontend to Vercel
    print("\n--- Step 3: Deploy Frontend to Vercel ---")
    fe_env_path = "frontend/.env.production"
    print(f"Setting production API URL: {backend_url}")
    with open(fe_env_path, "w") as f:
        f.write(f"VITE_API_URL={backend_url}\n")

    print("\nStaging frontend deployment. Answer the Vercel prompts:")
    print("- Set up and deploy: Yes")
    print("- Link to existing project: No")
    print("- What name: (Press Enter to keep default 'frontend')")
    print("- Modify settings: No")
    
    if not run_cmd("npx vercel --prod", cwd="frontend"):
        print("Frontend deployment failed.")
        return

    # 4. Git Repository Push
    print("\n--- Step 4: Git Remote Push ---")
    git_remote = input("Enter your GitHub/GitLab remote repository URL (leave blank to skip): ").strip()
    if git_remote:
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
            run_cmd("git push -u origin master")
    else:
        print("Skipping Git push.")

    print("\n==================================================")
    print("🎉 DEPLOYMENT STEPS COMPLETED!")
    print(f"Backend URL: {backend_url}")
    print("Frontend URL: Check the Vercel output URL above.")
    print("==================================================")

if __name__ == "__main__":
    deploy()
