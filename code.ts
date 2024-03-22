// src/main.ts
figma.showUI(__html__);

// Set to store unique font sizes
let uniqueFontSizes: Set<number> = new Set();

// Function to handle messages from the UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'generate') {
    const unwantedNames: string[] = msg.unwantedNames || [];
    console.log(unwantedNames)
    uniqueFontSizes.clear(); // Clear the set before populating it again
    figma.currentPage.selection.forEach(node => {
      console.log(node.type)
      findSizes(node, unwantedNames)
    });

    // Generate static text styles for each font size
    const textStyles = Array.from(uniqueFontSizes).map(fontSize => `static TextStyle get text${fontSize}Px => const TextStyle(fontSize: ${fontSize});`);

    // Send generated text styles back to the UI
    figma.ui.postMessage({ type: 'textStyles', textStyles });
  }
};

function findSizes(node: SceneNode, unwantedNames: string[]) {

  if (unwantedNames.includes(node.name)) {
    return
  } else if (node.type === 'TEXT') {
    // Add font size to the set
    if (typeof (node as TextNode).fontSize === 'number') {
      uniqueFontSizes.add((node as TextNode).fontSize as number)
    }

  } else if (node.type === 'FRAME' || node.type === 'SECTION' || node.type === 'GROUP' || node.type === "COMPONENT_SET" || node.type === "INSTANCE" || node.type === "BOOLEAN_OPERATION") {
    // Iterate through children of the frame
    (node as FrameNode | SectionNode | GroupNode | ComponentSetNode | InstanceNode | BooleanOperationNode).children.forEach(child => {
      findSizes(child, unwantedNames); // Recursive call for each child node
    });
  }
}