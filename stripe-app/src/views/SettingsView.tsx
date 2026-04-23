import {
  Box,
  SettingsView as StripeSettingsView,
  Link,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

const SettingsView = ({ environment }: ExtensionContextValue) => {
  const dashboardUrl = `https://dunningdog.com/app/settings?ref=stripe-app`;

  return (
    <StripeSettingsView>
      <Box
        css={{
          padding: "medium",
          stack: "y",
          gap: "medium",
        }}
      >
        <Box css={{ font: "heading" }}>DunningDog Settings</Box>
        <Box css={{ font: "body", color: "secondary" }}>
          Manage your DunningDog recovery settings, email sequences, and
          branding from the DunningDog dashboard.
        </Box>

        <Link href={dashboardUrl} type="primary" target="_blank">
          Open DunningDog Settings
        </Link>

        <Box
          css={{
            padding: "medium",
            backgroundColor: "container",
            stack: "y",
            gap: "small",
          }}
        >
          <Box css={{ font: "subtitle" }}>What you can configure</Box>
          <Box css={{ font: "body" }}>
            - Email sequence timing and content
          </Box>
          <Box css={{ font: "body" }}>
            - Custom branding (logo, colors)
          </Box>
          <Box css={{ font: "body" }}>
            - Notification preferences
          </Box>
          <Box css={{ font: "body" }}>
            - Recovery email templates
          </Box>
        </Box>

        <Box css={{ font: "caption", color: "secondary" }}>
          Need help? Contact us at support@dunningdog.com
        </Box>
      </Box>
    </StripeSettingsView>
  );
};

export default SettingsView;
