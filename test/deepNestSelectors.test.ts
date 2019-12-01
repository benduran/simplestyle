
import createStyles, { getAllSheets } from '../src';

test('Test deeply nested psuedo selectors (fun stuff!)', () => {
  const styles = createStyles({
    deep: {
      '& > span.nest1': {
        '&:hover > svg.nest2': {
          '&:before': {
            content: '"deep"',
          },
        },
      },
    },
  }, false);
  const [sheet] = getAllSheets();
  const rendered = sheet.getStyles();
  expect(rendered.length).toBeGreaterThan(0);
  expect(rendered.indexOf(styles.deep)).toBeGreaterThan(-1);
});
