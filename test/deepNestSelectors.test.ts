
import createStyles, { getAllSheets } from '../src';

test('Test deeply nested psuedo selectors (fun stuff!)', () => {
  const styles = createStyles({
    deep: {
      $nested: {
        '& > span.nest1': {
          $nested: {
            '&:hover > svg.nest2': {
              $nested: {
                '&:before': {
                  content: '"deep"',
                },
              },
            },
          },
        },
      },
    },
  });
  const [sheet] = getAllSheets();
  const rendered = sheet.getStyles();
  expect(rendered.length).toBeGreaterThan(0);
  expect(rendered.indexOf(styles.deep)).toBeGreaterThan(-1);
});
