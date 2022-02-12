'use babel';

export default function pascalCase(words, separator='_') {
  return words.split(separator).map((w)=>{
    let wl = w.toLowerCase();
    return wl.charAt(0).toUpperCase() + wl.slice(1)
  }).join(' ');
}
