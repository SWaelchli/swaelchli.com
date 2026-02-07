---
title: "Sourdough Hydration Calculator"
date: 2026-02-06
draft: false
description: "A little tool to calculate the ingredients weight to achieve a certain hydration."
tags: ["Coding", "Baking"]
#wide: false
---

<!-- Write an introduction here -->

This is a small tool that helps me calculate the ingredients for my sourdough bread based on the starter that I have at hand and the desired hydration of the dough.


<!-- Tool / Project here -->


***
{{< hydration_calc >}}
***

### How it works

The tool works on a short JavaScript code that is doing simple arithmetic to calculate the ingredients.

+ The tool is assuming a desired salt content of 2%.
+ The tool is assuming a water loss of 15% during baking.



You can access the code on this website's [GitHub repository](https://github.com/SWaelchli/swaelchli.com/tree/master/static/projects/hydration_calc)

### Calculations:
**Definitions**

$$
\begin{aligned}
& m_{\text{Bread}} = \text{desired mass of bread} \; [\mathrm{g}]
\\[1em]
& m_{\text{Dough}} = \text{mass of dough} \; [\mathrm{g}]
\\[1em]
& m_{\mathrm{NaCl}} = \text{mass of salt} \; [\mathrm{g}]
\\[1em]
& m_{\text{Flour}} = \text{mass of flour} \; [\mathrm{g}]
\\[1em]
& m_{\mathrm{S}} = \text{mass of starter} \; [\mathrm{g}]
\\[1em]
& h = \text{desired hydration of dough} \; [\%]
\\[1em]
& h_{\mathrm{S}} = \text{hydration of starter} \; [\%]
\end{aligned}
$$

**Formulas**


$$
\begin{aligned}
& m_{Dough} =  m_S + m_F + m_W + m_{NaCl}
\\[1em]
& m_{Dough} = \frac {m_{Bread}}  {0.85}
\\[1em]
& m_{Bread} = m_{Dough} \cdot 0.85
\\[1em]
& m_{NaCl} = m_{Dough} \cdot 0.02
\\[1em]
& m_{Flour} = \frac {m_{Dough}}  {1 + h + m_{NaCl}}  - \frac {m_S}  {1 + h_S}  
\\[1em]
&m_{Water} =  {m_{Dough}} - \frac {m_{Dough}} {1 + h} 
\end{aligned}
$$