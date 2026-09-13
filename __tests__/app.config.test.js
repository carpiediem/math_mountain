describe("app.config.js", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.APP_VARIANT;
    delete process.env.SENTRY_DSN;
    delete process.env.EAS_PROJECT_ID;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns the production config by default", () => {
    const { expo: config } = require("../app.config.js");

    expect(config.name).toBe("Math Mountain");
    expect(config.scheme).toEqual(["math-mountain", "us.rslc.mathmountain"]);
    expect(config.android.package).toBe("us.rslc.mathmountain");
    expect(config.ios.bundleIdentifier).toBe("us.rslc.mathmountain");
    expect(config.extra.sentryDsn).toBe("");
    expect(config.extra.eas.projectId).toBe(
      "f6079bae-748b-44e4-8642-d2fb82d7396e",
    );
    expect(
      config.plugins.some(
        (plugin) =>
          Array.isArray(plugin) && plugin[0] === "@sentry/react-native",
      ),
    ).toBe(false);
  });

  it("returns the dev config with Sentry configured when env vars are set", () => {
    process.env.APP_VARIANT = "development";
    process.env.SENTRY_DSN = "https://key@bugsink.rslc.dev/1";
    process.env.EAS_PROJECT_ID = "test-project-id";

    const { expo: config } = require("../app.config.js");

    expect(config.name).toBe("Math Mountain (Dev)");
    expect(config.scheme).toEqual([
      "math-mountain-dev",
      "us.rslc.mathmountain.dev",
    ]);
    expect(config.android.package).toBe("us.rslc.mathmountain.dev");
    expect(config.ios.bundleIdentifier).toBe("us.rslc.mathmountain.dev");
    expect(config.extra.sentryDsn).toBe(process.env.SENTRY_DSN);
    expect(config.extra.eas.projectId).toBe("test-project-id");

    const sentryPlugin = config.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === "@sentry/react-native",
    );
    expect(sentryPlugin[1]).toEqual({
      url: "https://bugsink.rslc.dev/",
      organization: "bugsinkhasnoorgs",
      project: "math-mountain",
    });
  });
});
