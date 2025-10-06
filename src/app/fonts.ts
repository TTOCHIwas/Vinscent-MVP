// CSS에서 CDN으로 로드하므로 fonts.ts는 CSS 변수만 설정
export const pretendard = {
  variable: '--font-pretendard',
  className: 'font-pretendard'
}

export const fontWeights = {
  thin: 100,
  extraLight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const

export type FontWeight = keyof typeof fontWeights