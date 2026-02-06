---
title: "Dough Hydration Calculator"
date: 2026-02-06
draft: false
description: "A little tool to calulate the ingridients weight to achieve a certain hydration."
tags: ["Coding", "Baking"]
#wide: false
---

<!-- Write a introduction here -->

This is a small tool that helps me calulating the ingredients for my sourdough bread based on the starter that I have at hand and the desired hydration of the dough.


<!-- Tool / Project here -->

{{< hydration_calc >}}

### How it works

The tool works on a short javascript code that is doing simple arythmitics to calulate the ingredients.
-The tool is assuming a desired salt content of 2%.

You can access the code on this website's [github repository] (https://github.com/SWaelchli/swaelchli.com/blob/master/layouts/shortcodes/overhead_tank.html)

### Calulations:
**Definitions**

$$
m_{\text{bread}} = \text{desired mass of bread} \; [\mathrm{g}]
$$
$$
m_{\text{dough}} = \text{mass of dough} \; [\mathrm{g}]
$$
$$
m_{\mathrm{NaCl}} = \text{mass of salt} \; [\mathrm{g}]
$$
$$
m_{\text{flour}} = \text{mass of flour} \; [\mathrm{g}]
$$
$$
m_{\mathrm{S}} = \text{mass of starter} \; [\mathrm{g}]
$$
$$
h = \text{desired hydration of dough} \; [\%]
$$
$$
h_{\mathrm{S}} = \text{hydration of starter} \; [\%]
$$

**Formulas**


$$
m_{Dough} =  m_S + m_F + m_W + m_{NaCl}
$$

$$
m_{Dough} = \frac {m_{Bread}}  {0.85}
$$

$$
m_{Bread} = m_{Dough} \cdot 0.85
$$

$$
m_{NaCl} = m_{Dough} \cdot 0.02
$$


$$
m_{Flour} = \frac {m_{Dough}}  {1 + h + m_{NaCl}}  - \frac {m_S}  {1 + h_S}  
$$

$$
m_{Water} =  {m_{Dough}} - \frac {m_{Dough}} {1 + h} 
$$