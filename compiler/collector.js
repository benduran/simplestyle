/** @type {Map<'ssjs-imports' | 'ssjs-globals' | 'ssjs-styles', string[]>} */
const COLLECTOR = new Map();

export function resetCollector() {
  COLLECTOR.clear();
  COLLECTOR.set('ssjs-imports', []);
  COLLECTOR.set('ssjs-globals', []);
  COLLECTOR.set('ssjs-styles', []);
}

resetCollector();

export { COLLECTOR };
