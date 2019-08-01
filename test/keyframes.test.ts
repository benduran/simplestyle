
import createStyles, { getAllSheets, keyframes } from '../src';

test('Create keyframes for animations', () => {
  const animName = keyframes({
    '0%': {
      backgroundColor: 'red',
    },
    '50%': {
      backgroundColor: 'blue',
    },
    '100%': {
      backgroundColor: 'yellow',
    },
  }, false);
  const styles = createStyles({
    button: {
      animation: `${animName} 2s linear infinite`,
      height: '20px',
      width: '100px',
    },
  }, false);
  const [animSheet, styleSheet] = getAllSheets();
  const animRendered = animSheet.getStyles();
  const stylesRendered = styleSheet.getStyles();
  expect(animName).toBeDefined();
  expect(animRendered).toContain(`@keyframes ${animName}{0%{background-color:red;}50%{background-color:blue;}100%{background-color:yellow;}}`);
  expect(stylesRendered).toContain(`.${styles.button}{animation:${animName} 2s linear infinite;height:20px;width:100px;}`);
});
