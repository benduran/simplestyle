
import createClassName from '../src/createClassName';

test('Should generate unique classname with some random alpha suffix', () => {
  const seed = new Date().getTime();
  const classname = createClassName(seed, 'testing');
  const classname2 = createClassName(seed + 1, 'testing');
  expect(classname.indexOf('testing')).toBe(0);
  expect(classname2.indexOf('testing')).toBe(0);
  expect(classname).not.toBe(classname2);
});
