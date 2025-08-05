function isEditable(node) {
    if (!node) return false;
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const tag = node.tagName.toLowerCase();
    const editable = node.isContentEditable;
    return tag === "textarea" || tag === "input" || editable;
  }
  
  function replaceInTextNode(textNode) {
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
  
    const parent = textNode.parentNode;
    if (isEditable(parent)) return; // Don't mess with inputs/textareas
  
    const newText = textNode.textContent.replace(/—/g, '-');
    if (newText !== textNode.textContent) {
      textNode.textContent = newText;
    }
  }
  
  function runIfEnabled(callback) {
    chrome.storage.sync.get(["enabled"], (result) => {
      if (result.enabled ?? true) callback();
    });
  }
  
  // Initial pass
  runIfEnabled(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      replaceInTextNode(node);
    }
  });
  
  // Observe new mutations
  const observer = new MutationObserver((mutations) => {
    runIfEnabled(() => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              replaceInTextNode(node);
            } else {
              const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
              let textNode;
              while ((textNode = walker.nextNode())) {
                replaceInTextNode(textNode);
              }
            }
          });
        } else if (mutation.type === "characterData") {
          replaceInTextNode(mutation.target);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  