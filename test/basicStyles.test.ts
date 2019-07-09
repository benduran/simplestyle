
import createStyles, { getAllSheets } from '../src';

test('Create baseline tests', () => {
  const styles = createStyles({
    basic: {
      backgroundColor: 'red',
    },
  });
  const [sheet] = getAllSheets();
  expect(styles).toBeDefined();
  expect(sheet.getStyles().indexOf(styles.basic)).toBeGreaterThan(-1);
  expect(sheet.getStyles().indexOf('background-color:red;')).toBeGreaterThan(-1);
});
