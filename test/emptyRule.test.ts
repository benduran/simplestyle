
import createStyles, { getAllSheets } from '../src';

test('Allow classname generation on empty rulesets', () => {
  const styles = createStyles({
    empty: {},
    emptyRef: {
      '& > $empty > div': {
        backgroundColor: 'purple',
      },
    },
  }, false);
  const [sheet] = getAllSheets();
  const rendered = sheet.getStyles();
  expect(rendered.indexOf(`.${styles.emptyRef} > .${styles.empty} > div{background-color:purple;}`)).toBeGreaterThan(-1);
});
