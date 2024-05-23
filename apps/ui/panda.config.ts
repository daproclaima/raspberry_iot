// panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
// https://codesandbox.io/p/devbox/park-ui-examples-react-next-js-gqtr26?file=%2F.gitignore%3A16%2C7
export default defineConfig({
    preflight: true,
    presets: [
        "@pandacss/preset-base",
        createPreset({
            accentColor: "blue",
            grayColor: "sand",
            borderRadius: "xl",
        }),
        // "@park-ui/panda-preset"
    ],
    include: ["./src/**/*.{js,jsx,ts,tsx}"],
    exclude: [],
    jsxFramework: "react",
    outdir: "./src/styled-system",
});
