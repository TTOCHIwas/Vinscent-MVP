import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y", 
    "@chromatic-com/storybook",
  ],
  
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextConfigPath: path.resolve(__dirname, '../next.config.js')
    }
  },
  
  staticDirs: ["../public"],
  
  // 🔧 추가: 안정성 향상
  core: {
    disableTelemetry: true,
  },

  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  viteFinal: async (config) => {
    // 🔧 개선: Next.js Image 최적화 처리
    config.define = config.define || {};
    config.define['process.env.__NEXT_IMAGE_OPTS'] = JSON.stringify({
      unoptimized: true,
      domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    });
    
    // 🔧 추가: 모듈 해석 개선
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    };
    
    // 🔧 추가: package.json 경로 명시
    config.root = path.resolve(__dirname, '..');
    
    return config;
  }
};

export default config;