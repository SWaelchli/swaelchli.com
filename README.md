Hugo command to start server:       


Documentation:




# swaelchli.com

This repository contains the source code and content for my personal website, [swaelchli.com](https://swaelchli.com). The site is built using the **Hugo** static site generator, providing a fast, secure, and easily maintainable platform for sharing my projects and interests.

## Website Overview

The website serves as a central hub for my professional background and personal hobbies. Visitors can find information regarding:

* **Professional Experience:** Insights into my work in Project Management and Mechanical Engineering, specifically within the field of rotating equipment.
* **Technical Projects:** Documentation of my "homelab" journey, including configurations for Proxmox, Docker, and various self-hosted services.
* **Personal Interests:** Updates on my latest hobbies, such as 3D printing projects, sourdough baking, and my training progress for upcoming runs like the Art Car IPA 5K.
* **Language Learning:** A space to document my progress as I study Spanish.

## Technologies Used

* **Static Site Generator:** [Hugo](https://gohugo.io/)
* **Hosting & Deployment:** Managed via Cloudflare and Nginx.
* **Version Control:** GitHub for source code management and history.
* **Theme / Design:** [Hugo paper by Nanxiaobei](https://github.com/nanxiaobei/hugo-paper)

## Project Structure

* `/content`: Contains the Markdown files for blog posts, project pages, and the "About Me" section.
* `/static`: Stores assets such as images, PDFs, and other non-processed files.
* `/themes`: Holds the styling and layout templates for the site.
* `hugo.toml` (or `config.toml`): The primary configuration file for site-wide settings and navigation.

## 🚀 How to Run the Website Locally

Choose one of the two options below depending on how you want to access the preview from your web browser.

### Option A: Accessing via IP Address (Simple & Direct)
Use this option if you want to preview the site from any device on your local network (e.g., accessing an LXC container from your PC) without editing hosts files or setting up local DNS.

```bash
hugo server -D --bind 0.0.0.0 --baseURL=http://192.168.1.103:1313/ --port 1313
```
* **How to open:** Open your browser and navigate to: [http://192.168.1.103:1313](http://192.168.1.103:1313)
* **Why it works:** Setting the `--baseURL` to the LXC IP prevents internal links from redirecting you to your public, live domain.

---

### Option B: Accessing via swaelchli.com (Behind Reverse Proxy / SSL)
Use this option if you are running a local reverse proxy (like Nginx) that handles SSL, and you have mapped `swaelchli.com` locally to your development server's IP.

```bash
hugo server -D --baseURL=https://swaelchli.com/ --bind 0.0.0.0 --port 1313 --appendPort=false --liveReloadPort=443
```
* **How to open:** Open your browser and navigate to: [https://swaelchli.com](https://swaelchli.com)
* **Why it works:** `--liveReloadPort=443` routes the WebSocket live-reload connection safely through your proxy.

---

## 📚 Theme Reference
This site uses the **hugo-paper** theme.
* Documentation: [https://github.com/nanxiaobei/hugo-paper](https://github.com/nanxiaobei/hugo-paper)
