module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@/domain": "./src/domain",
            "@/services": "./src/services",
            "@/hooks": "./src/hooks",
            "@/components": "./src/components",
            "@/screens": "./src/screens",
            "@/theme": "./src/theme",
            "@/utils": "./src/utils",
          },
        },
      ],
    ],
  };
};
