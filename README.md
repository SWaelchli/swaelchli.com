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

## How to Run Locally

To preview the site locally, ensure you have Hugo installed and run:

```bash
hugo server -D
```
The site will be available at `http://localhost:1313`
