# Deploying SlothDesk AI to Render 🚀

SlothDesk AI is pre-configured for deployment on **[Render](https://render.com/)**.

You can deploy using either **Docker (Recommended - 1-Click Blueprint)** or as a standard **Web Service**.

---

## Method 1: Deploy with Render Blueprint (Easiest & Fastest)

SlothDesk AI includes a [`render.yaml`](render.yaml) blueprint that configures everything automatically.

1. Push your code to your GitHub repository (already done! 👉 `https://github.com/tani2112/Sloathdesk-AI`).
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** in the top right and select **Blueprint**.
4. Connect your GitHub account and select the **`Sloathdesk-AI`** repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Runtime:** Docker (Multi-stage build compiling React and serving via FastAPI)
   - **Plan:** Free
   - **Port:** `10000` (automatically bound via `$PORT`)
6. Click **Apply**.
7. In a few minutes, Render will build and launch your live application at `https://slothdesk-ai.onrender.com`!

---

## Method 2: Manual Web Service Setup on Render

If you prefer to configure the Web Service manually:

1. In Render Dashboard, click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository** and connect `tani2112/Sloathdesk-AI`.
3. Choose **Docker** as the Runtime:
   - **Name:** `slothdesk-ai`
   - **Region:** Any (e.g. Oregon or Frankfurt)
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Plan:** `Free`
4. Click **Create Web Service**.

---

## 🦥 Local AI on Render (Important Note)

- **Cloud / Render Environment:** When deployed on Render, SlothDesk AI runs in cloud container mode.
- If an external Ollama instance is accessible (e.g. via ngrok or cloud GPU), you can configure the `OLLAMA_URL` environment variable.
- **Offline / Heuristic Fallback:** If Ollama is not connected, the application will automatically run using its built-in rule-based heuristics, SHA-256 duplicate detection, category sorting, and undo history without throwing any errors!
