
import createStyles, { getAllSheets } from '../src';

test('Nested comma separated selectors with shared &:hover style definition', () => {
  const styles = createStyles({
    buttonBar: {
      '& > a, & > button': {
        '&:hover': {
          backgroundColor: 'blue',
        },
        backgroundColor: 'red',
        width: '100%',
      },
    },
  }, false);
  const [sheet] = getAllSheets();
  const rendered = sheet.getStyles();
  expect(rendered).toContain(`.${styles.buttonBar} > a, .${styles.buttonBar} > button{background-color:red;width:100%;}`);
  expect(rendered).toContain(`.${styles.buttonBar} > a:hover, .${styles.buttonBar} > button:hover{background-color:blue;}`);
});
