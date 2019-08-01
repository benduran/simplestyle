
import createStyles from '../src';
import { getAll } from '../src/sheetCache';

test('Create baseline tests', () => {
  const styles = createStyles({
    basic: {
      backgroundColor: 'red',
    },
  }, false);
  const [sheet] = getAll();
  expect(styles).toBeDefined();
  expect(sheet.getStyles().indexOf(styles.basic)).toBeGreaterThan(-1);
  expect(sheet.getStyles().indexOf('background-color:red;')).toBeGreaterThan(-1);
});
