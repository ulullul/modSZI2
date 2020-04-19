import invoke from 'lodash/invoke';
import isString from 'lodash/isString';

export function updateTag(
  tagName,
  keyName,
  keyValue,
  attributeName,
  attributeValue,
) {
  const node = invoke(
    document,
    'head.querySelector',
    `${tagName}[${keyName}="${keyValue}"]`,
  );
  if (node && node.getAttribute(attributeName) === attributeValue) return;

  // Remove and create a new tag in order to make it work with bookmarks in Safari
  if (node) {
    node.remove();
  }
  if (isString(attributeValue)) {
    const nextNode = document.createElement(tagName);
    nextNode.setAttribute(keyName, keyValue);
    nextNode.setAttribute(attributeName, attributeValue);
    invoke(document, 'head.append', nextNode);
  }
}

export function updateMeta(name, content) {
  updateTag('meta', 'name', name, 'content', content);
}

export function updateCustomMeta(property, content) {
  updateTag('meta', 'property', property, 'content', content);
}

export function updateLink(related, href) {
  updateTag('link', 'rel', related, 'href', href);
}
