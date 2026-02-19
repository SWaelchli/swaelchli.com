---
title: "Fluid Velocity Calculator"
date: 2026-02-18
lastmod: 2026-02-18
draft: false
description: "Pipe Sizing Tools - Based on Fluid Velocity"
tags: ["API", "Engineering", "Coding"]
#wide: false
---

In my former daily work as a system engineer, I had to calculate pipe sizes and ensure that the velocity of the process gas or liquid does not exceed the allowable limits. We used an Excel sheet for this purpose, but I wanted something more visual, so I built this tool. It combines a simple Process Flow Diagram (PFD) drawing area with a calculation table. 

It is not as polished as I wish, and I would love to expand on it in the future.

***

{{< pipe_calc >}}

***

## How it works

The workflow is pretty simple. First, you use the buttons above the canvas to draw your pipe layout or place symbols. Every time you draw a new pipe line, the tool automatically adds a row to the data table below. 

In the table, you just pick your standard pipe size (NPS and Schedule) from the dropdowns and type in your volume flow. You can choose between GPM or m³/hr. 

Once you hit the "Calculate All Velocities" button, it gives you the exact fluid speed in both ft/s and m/s. As a nice bonus, it also color-codes the lines in your drawing from green to red, where the red pipes are the ones with the highest velocity.
