# Step-by-Step Deployment Guide

## 🚀 Complete Guide to Deploy Your Coffee Order App

This guide will walk you through deploying your app to Vercel (recommended) or any other hosting platform.

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Project

1. **Make sure your code is ready:**
   ```bash
   cd coffee-order-app
   npm install
   npm run build
   ```
   
   If the build succeeds, you're ready!

2. **Get your Telegram credentials:**
   - **Bot Token:** 
     - Open Telegram
     - Search for `@BotFather`
     - Send `/newbot` and follow instructions
     - Copy the token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
   
   - **Chat ID:**
     - Open Telegram
     - Search for `@userinfobot`
     - Send any message
     - Copy the Chat ID number (like: `123456789`)
   
   - **Important:** Send `/start` to your bot first!

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Complete the signup process

### Step 3: Install Vercel CLI

1. **Open Terminal/Command Prompt**
2. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```
   
   Or if you prefer npx (no installation needed):
   ```bash
   npx vercel
   ```

### Step 4: Deploy to Vercel

1. **Navigate to your project folder:**
   ```bash
   cd coffee-order-app
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   Follow the prompts to login

3. **Deploy your project:**
   ```bash
   vercel
   ```
   
   **First time deployment prompts:**
   - "Set up and deploy?" → Type `Y` and press Enter
   - "Which scope?" → Select your account
   - "Link to existing project?" → Type `N` and press Enter
   - "What's your project's name?" → Type a name (e.g., `coffee-order-app`) or press Enter for default
   - "In which directory is your code located?" → Press Enter (it should be `./`)
   - "Want to override the settings?" → Type `N` and press Enter

4. **After deployment, you'll get a URL like:**
   ```
   https://coffee-order-app-abc123.vercel.app
   ```

### Step 5: Set Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add Environment Variables:**
   
   Click "Add New" for each variable:
   
   **Variable 1:**
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: `your_bot_token_here` (paste your actual token)
   - Environment: Select all (Production, Preview, Development)
   - Click "Save"
   
   **Variable 2:**
   - Name: `TELEGRAM_CHAT_ID`
   - Value: `your_chat_id_here` (paste your actual chat ID)
   - Environment: Select all
   - Click "Save"
   
   **Variable 3:**
   - Name: `ALLOWED_ORIGINS`
   - Value: `https://your-project-name.vercel.app,https://your-custom-domain.com` (use your Vercel URL, add custom domain if you have one)
   - Environment: Select all
   - Click "Save"
   
   **Variable 4:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environment: Select all
   - Click "Save"

4. **Redeploy after setting variables:**
   ```bash
   vercel --prod
   ```
   
   Or go to Vercel Dashboard → Deployments → Click "..." → "Redeploy"

### Step 6: Test Your Deployment

1. **Visit your deployed URL** (from Step 4)
2. **Test the app:**
   - Add a drink to cart
   - Fill out the order form
   - Submit the order
   - Check your Telegram - you should receive the order!

3. **If it works - Congratulations! 🎉**

---

## Option 2: Deploy via GitHub (Automatic Deployments)

### Step 1: Push to GitHub

1. **Create a GitHub repository:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., `coffee-order-app`)
   - Make it Public or Private
   - Don't initialize with README (unless you want to)
   - Click "Create repository"

2. **Push your code:**
   ```bash
   cd coffee-order-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/coffee-order-app.git
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your GitHub username

### Step 2: Import to Vercel

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"

2. **Import from GitHub:**
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: Vite (should auto-detect)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `dist` (should auto-detect)
   - Click "Deploy"

4. **Set Environment Variables:**
   - After deployment starts, click "Environment Variables"
   - Add the same variables as in Option 1, Step 5
   - Redeploy after adding variables

5. **Automatic Deployments:**
   - Every time you push to GitHub, Vercel will automatically redeploy!
   - You can configure this in Settings → Git

---

## Option 3: Deploy to Other Platforms

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build your project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Set environment variables:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ALLOWED_ORIGINS`, `NODE_ENV`

### Render

1. **Create a new Web Service**
2. **Connect your GitHub repo**
3. **Build Command:** `npm run build`
4. **Start Command:** `npm run preview` (or use static site mode)
5. **Set environment variables in the dashboard**

### Any Static Hosting

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your hosting provider
3. **Set up serverless function** for the API (or use a backend service)
4. **Configure environment variables** in your hosting platform

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to API" after deployment

**Solution:**
- Check that environment variables are set correctly
- Verify `ALLOWED_ORIGINS` includes your deployed URL
- Check browser console for CORS errors
- Verify the API endpoint is accessible at `/api/send-order`

### Issue: "Server not configured" error

**Solution:**
- Make sure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set
- Check that environment variables are set for the correct environment (Production)
- Redeploy after setting environment variables

### Issue: Orders not appearing in Telegram

**Solution:**
- Verify bot token is correct
- Check that chat ID is correct
- Make sure you've sent `/start` to your bot
- Check Vercel function logs for errors

### Issue: CORS errors in browser

**Solution:**
- Set `ALLOWED_ORIGINS` environment variable
- Include your exact domain (with https://)
- Redeploy after setting the variable

---

## 📝 Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] `ALLOWED_ORIGINS` includes your domain
- [ ] Test order submission works
- [ ] Orders appear in Telegram
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs
- [ ] Site loads correctly
- [ ] All pages work

---

## 🎉 You're Done!

Your coffee order app is now live! Share the URL with your customers.

**Remember:**
- Monitor your Vercel dashboard for any errors
- Check Telegram regularly for new orders
- Set up a custom domain (optional) in Vercel Settings → Domains

---

## 💡 Pro Tips

1. **Custom Domain:**
   - Go to Vercel Settings → Domains
   - Add your custom domain
   - Update `ALLOWED_ORIGINS` to include your custom domain

2. **Monitoring:**
   - Check Vercel Analytics for traffic
   - Monitor function logs for errors
   - Set up alerts if needed

3. **Updates:**
   - Just push to GitHub (if connected) for automatic deployment
   - Or run `vercel --prod` for manual deployment

---

*Need help? Check the troubleshooting section or review the error messages in your browser console and Vercel logs.*

