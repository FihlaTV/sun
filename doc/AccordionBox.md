## General Design Considerations
PhET JS Files: ExpandCollapseBar.js, ExpandCollpaseButton.js, AccordionBox.js:

Here’s when and why we use accordion boxes:
* Default state can be expanded or collapsed depending on how the designer wants to scaffold the user interaction. A closed panel can be used to keep the default opening condition of sim from being visually overwhelming, and suggesting a logical route for exploration, for example in Build an Atom and in GE:B.
* Accordion boxes can also be useful for teachers to ask predictive questions.
* Can contain non-interactive readouts, interactive controls, but not sprites (e.g., draggable toolbox items).

###Components of an Accordion Box
Adapted from: ARIA Pracrices 1.1, [section 3.1 Accordion](https://www.w3.org/TR/wai-aria-practices/#accordion)
* Accordion Header: Title or label for or thumbnail (usually a heading with a +/- icon) representing a section of content that also serves as a control for showing, and in some implementations, hiding the section of content.
* Accordion Panel: Section of content associated with an accordion header.

## Aesthetic Considerations
* If space is a concern, the title can be hidden while the accordion box is expanded. 
* An expanded accordion box cannot overlap other elements when opened (unlike combo box, for instance).
* Always includes a toggle button to expand/collapse, typically to the left of the title.  
* Other sim content does not fill the space when an accordion box is collapsed.
* The accordion box content can be expanded or collapsed by default and a change of state for one accordion does not typically affect the state of other accordion boxes.
 

## Accessibility Considerations
* Typically, has a visual title with an icon that indicates expanded and collapsed state.
  * The title may may disappear when box is expanded.
  * Focus highlight would go around title in both the expanded and collapsed states, if title remains visible.
  * If title visually disappears when expanded, the focus highlight would be limited to the open/close icon and the designer would need to consider extra padding to ensure a reasonable clickable area. 
  * It is possible that the focus highlight can change size when toggling between expanded/collapsed states in the scenario when the expanded box does not have a title. 
* The typical structure is a `button` nested within the parent titling element, likely a heading.
* Typically, the open/close icon does not need to be represented in the Parallel DOM.
* For accessibility the expanded and collapsed states of the box are communicated through a combination of ARIA attributes, `aria-expanded`, `aria-controls`, `aria-hidden` that have to be managed through javascript.

### Gesture Support
ToDO.

### Keyboard Support
Adapted from: ARIA Pracrices 1.1, [section 3.1 Accordion](https://www.w3.org/TR/wai-aria-practices/#accordion)
| Key        | Function |
| ------------- |-------------|
| Enter or Space |When focus is on the accordion header of a collapsed section, expands or collapses the accordion panel.|
|Down Arrow (optional) | * If focus is on an accordion header, moves focus to the next accordion header. If focus is on the last accordion header, either does nothing or moves focus to the first accordion header.
* If there is only one accordion, doing nothing with focus is likely appropirate. |
| Up Arrow (Optional) | * If focus is on an accordion header, moves focus to the previous accordion header. If focus is on the first accordion header, either does nothing or moves focus to the last accordion header.
* If there is only one accordion, doing nothing with focus is likely appropirate.|
| Home and End (Optional)| Likely only relevant if there are several to many accordions (to discuss) |
| Control + Page Down and
Control + Page Up (Optional) | Behave the same way as Up and Down Arrows. (to discuss) |

### Management of Role, Property, State, and Tabindex Attributes
Adapted from: ARIA Pracrices 1.1, [section 3.1 Accordion](https://www.w3.org/TR/wai-aria-practices/#accordion)
| Role | Attribute | Element | Usage |
| ---- | --------- | ------- | ----- |
| ---- |-------------| button | The title content of each accordion header is contained in an element with role button.|
| ---- |---------| `h3` (or appropriate level) | * PhET Sims use native HTML, so we use native heading and button elements to create the accordion header.|
* The button element is the only element inside the heading element. That is, if there are other visually persistent elements, they are not included inside the heading element.
| ---- | `aria-expanded="true/false"`| div | Added to accordion panel dynamically with Javascript to indicate when the panel associated with the header is visible (`aria-expanded="true"`), or if the panel is not visible, `aria-expanded` is set to `false`.|
| ---- | aria-controls="[ID REF of element contianing accordion panel]"| button | ----- |
| ---- | aria-disabled="true"| ------- | If the accordion panel associated with an accordion header is visible, and if the accordion does not permit the panel to be collapsed, the header button element has `aria-disabled` set to true. (I think this is N/A for PhET sims?? ) |
| region (optional) | aria-labelledby=[ID REF of button that controls the display of the panel] | `div` | ----- |


### DRAFT: Sample HTML
```html
<! -- expanded state -->
	<h3>
	   <button id="accordion-header-01" aria-expanded="true" aria-controls="accordion-panel-01">Factors</button>
	</h3>
	<div id="accordion-panel-01" role="region" aria-labelledby="accordion-header-01">
	   <p>Box content.</p>
	   <p>More content or even other HTML controls.</p>
	</div>
<! -- collapsed state -->
  <h3>
     <button id="accordion-header-02" aria-expanded="false" aria-controls="accordion-panel-02">Product</button>
  </h3>
  <div id="accordion-panel-02" role="region" aria-labelledby="accordion-header-02" aria-hidden="true">
     <p>Box content.</p>
     <p>More content or even other HTML controls.</p>
  </div>
```
### Supporting Accessibility Resources
* Adapted from [ARIA Practices]()

### Design Doc Content Template Text
**ExpandCollapseBar** or **Expand Collpase Button**
Accordion Header:
Accessible Name: (Defaults to the same as the title)
Accordion Title Hidden: Yes/No (defaults to No)
If using a heading as the button wrapper, define heading level: (defaults is H3)
Default open state: expanded/collapsed (Question: What is the best default?)

**Accordion Box**
Accordion Panel:
Parent container accordion box contents: defaults to a div
 - Use same convention as other objects and controls.



