import * as fn from './fn';

/**
 * A poor man's UI library
 * For when you want to work with the raw DOM
 */

interface StyleSpec {
  [index: string]: string | number;
}

interface DomElementSpec {
  style?: StyleSpec,
  [index: string]: StyleSpec | Function | string | number;
}

type DomFactoryParam = string | HTMLElement | DomElementSpec;

function isDomElementSpec (arg: DomFactoryParam): arg is DomElementSpec {
  return typeof arg === 'object';
}

function domFactoryFactory (elementName: string) {
  /**
   * Function which create DOM elements with corresponding tag names
   * and initializes them with certain properties
   * Arguments may be accepted in any order:
   * - HTMLElement - the element is appended to the object in that position
   * - String - A text node is created and appended to the object
   * - Object - Properties of the object are assigned to the element
   *    * type is Function and name starts with "on" - Added as an event callback
   *    * Otherwise, assigned through setAttribute()
   */
  return function domFactory (...args: DomFactoryParam[]): HTMLElement {
    const element: HTMLElement = document.createElement(elementName);
    for (let arg of args) {
      if (arg instanceof HTMLElement) {
        element.appendChild(arg);
      }
      else if (isDomElementSpec(arg)) {
        for (let [key, value] of fn.ienumerate(arg)) {

          // event handlers
          if (key === 'style') {
            for (let [styleName, styleValue] of fn.ienumerate(<StyleSpec> value)) {
              const domStyleName = styleName.replace(/-[a-z]/g, char => char.toUpperCase());
              element.style[domStyleName] = '' + styleValue;
            }
          }
          else if (typeof value === 'function') {
            if (key.startsWith('on')) {
              element[key] = value;
            } else {
              element.addEventListener(key, <EventListener> value);
            }
          }
          // other properties
          else {
            const strValue = '' + value;
            element.setAttribute(key, strValue);
          }
        }
      }
      else if (typeof arg === 'string') {
        element.appendChild(document.createTextNode(arg));
      }
      else {
        throw Error(`Unknown argument type ${arg}`)
      }
    }
    return element;
  }
}

export const a        = domFactoryFactory('a');
export const aside    = domFactoryFactory('aside');
export const b        = domFactoryFactory('b');
export const button   = domFactoryFactory('button');
export const canvas   = domFactoryFactory('canvas');
export const col      = domFactoryFactory('col');
export const colgroup = domFactoryFactory('colgroup');
export const div      = domFactoryFactory('div');
export const form     = domFactoryFactory('form');
export const h1       = domFactoryFactory('h1');
export const h2       = domFactoryFactory('h2');
export const h3       = domFactoryFactory('h3');
export const h4       = domFactoryFactory('h4');
export const h5       = domFactoryFactory('h5');
export const h6       = domFactoryFactory('h6');
export const h7       = domFactoryFactory('h7');
export const header   = domFactoryFactory('header');
export const hr       = domFactoryFactory('hr');
export const i        = domFactoryFactory('i');
export const img      = domFactoryFactory('img');
export const input    = domFactoryFactory('input');
export const li       = domFactoryFactory('li');
export const main     = domFactoryFactory('main');
export const nav      = domFactoryFactory('nav');
export const ol       = domFactoryFactory('ol');
export const option   = domFactoryFactory('option');
export const p        = domFactoryFactory('p');
export const select   = domFactoryFactory('select');
export const span     = domFactoryFactory('span');
export const table    = domFactoryFactory('table');
export const tbody    = domFactoryFactory('tbody');
export const td       = domFactoryFactory('td');
export const textarea = domFactoryFactory('textarea');
export const th       = domFactoryFactory('th');
export const thead    = domFactoryFactory('thead');
export const tfoot    = domFactoryFactory('tfoot');
export const tr       = domFactoryFactory('tr');
export const ul       = domFactoryFactory('ul');

/** Remove all children from a parent element **/
export function removeChildren (element: HTMLElement) {
  for (let i of Array.from(element.childNodes)) {
    element.removeChild(i);
  }
}

export function insertChildAtIndex (parent: HTMLElement, index: number, child: HTMLElement) {
  // "|| null" converts undefineds to nulls.
  // Node.insertBefore() interprets null nextSiblings as "append at the end"
  const nextSibling = parent.children[index] || null;
  return parent.insertBefore(child, nextSibling);
}

export function removeChildAtIndex (parent: HTMLElement, index: number) {
  return parent.removeChild(parent.children[index]);
}

export function getIndexOfElementInParent (element: HTMLElement) {
  return Array.prototype.indexOf.call(element.parentElement.children,
      element);
}
