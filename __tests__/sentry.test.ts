import Constants from "expo-constants";
import { init } from "@sentry/react-native";

import { initSentry } from "../utils/sentry";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: {} } },
}));

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
}));

const mockInit = init as jest.Mock;

describe("initSentry", () => {
  afterEach(() => {
    mockInit.mockClear();
    (Constants as unknown as { expoConfig: { extra: object } }).expoConfig = {
      extra: {},
    };
  });

  it("does nothing when no Sentry DSN is configured", () => {
    initSentry();

    expect(mockInit).not.toHaveBeenCalled();
  });

  it("initializes Sentry when a DSN is configured", () => {
    (
      Constants as unknown as { expoConfig: { extra: { sentryDsn: string } } }
    ).expoConfig = { extra: { sentryDsn: "https://key@bugsink.example/1" } };

    initSentry();

    expect(mockInit).toHaveBeenCalledWith({
      dsn: "https://key@bugsink.example/1",
      tracesSampleRate: 0,
    });
  });
});
