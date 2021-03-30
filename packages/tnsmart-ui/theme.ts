const breakpoints: any = ['0px', '576px', '768px', '992px', '1200px', '1600px'];

breakpoints.xs = breakpoints[0];
breakpoints.sm = breakpoints[1];
breakpoints.md = breakpoints[2];
breakpoints.lg = breakpoints[3];
breakpoints.xl = breakpoints[4];
breakpoints.xxl = breakpoints[5];

const mediaQueries = {
  xs: `@media screen and (min-width: ${breakpoints[0]})`,
  sm: `@media screen and (min-width: ${breakpoints[1]})`,
  md: `@media screen and (min-width: ${breakpoints[2]})`,
  lg: `@media screen and (min-width: ${breakpoints[3]})`,
  xl: `@media screen and (min-width: ${breakpoints[4]})`,
  xxl: `@media screen and (min-width: ${breakpoints[5]})`,
};

const defaultTheme = {
  breakpoints,
  mediaQueries,
  prefix: 'ant',
  space: {
    0: '0px',
    1: '4px',
    2: '8px',
    2.5: '12px',
    3: '16px',
    4: '24px',
    4.5: '32px',
    5: '48px',
    6: '96px',
    7: '144px',
    8: '192px',
    9: '240px',
  },
  fontSizes: [
    '0px',
    '10px',
    '12px',
    '14px',
    '16px',
    '20px',
    '24px',
    '32px',
    '36px',
    '64px',
    '72px',
  ],
  inputPaddingBottom: 1,
  colors: {
    primary: '#16315A',
    // secondary: '#F48220',
    secondary: '#ff6a00',
    navigation: '#1c4280',
    success: '#4FB994',
    info: '#3f748d',
    warning: '#ff6a00',
    danger: '#EE4242',
    borderColor: '#e8e8e8',
    disabled: '#888888',
    disabledBackground: '#f5f5f5',
    placeholder: '#999999',
    link: '#00bbe7',
    background: '#f2f3f7',
    textDefault: '#3f748d',
    secondaryBackground: '#e6f7ff',
    lightBorder: '#f2f3f5',
    border: '#dddddd',
    // color by ant design
    red_1: '#FFE8E6',
    red_2: '#FFABA3',
    red_3: '#FF817A',
    red_4: '#FF5452',
    red_5: '#FF292C',
    red_6: '#FF000B',
    red_7: '#D90012',
    red_8: '#B30015',
    red_9: '#8C0015',
    red_10: '#660013',
    orange_1: '#FFF7E6',
    orange_2: '#FFDFA3',
    orange_3: '#FFCC7A',
    orange_4: '#FFB752',
    orange_5: '#FF9F29',
    orange_6: '#FF8300',
    orange_7: '#D96900',
    orange_8: '#B35000',
    orange_9: '#8C3A00',
    orange_10: '#662700',
    green_1: '#EBFFF5',
    green_2: '#BAF5D9',
    green_3: '#8BE8C0',
    green_4: '#60DBAA',
    green_5: '#3ACF98',
    green_6: '#18C188',
    green_7: '#0B9C70',
    green_8: '#027557',
    green_9: '#004F3D',
    green_10: '#002921',
    gray_1: '#FFFFFF',
    gray_2: '#FAFAFA',
    gray_3: '#F5F5F5',
    gray_4: '#E8E8E8',
    gray_5: '#D9D9D9',
    gray_6: '#BFBFBF',
    gray_7: '#888888',
    gray_8: '#595959',
    gray_9: '#282828',
    gray_10: '#000000',
    blue_1: '#BDC4C9',
    blue_2: '#9DACBD',
    blue_3: '#7690B0',
    blue_4: '#5375A3',
    blue_5: '#355A96',
    blue_6: '#1A428A',
    blue_7: '#0E2963',
    blue_8: '#06153D',
    blue_9: '#010617',
    blue_10: '#000000',
    mask: 'rgba(0, 0, 0, 0.7)',
    textPrimary: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
  },
};

export { defaultTheme };
