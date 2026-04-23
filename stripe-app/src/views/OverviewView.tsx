import {
  Box,
  ContextView,
  Icon,
  Link,
  Inline,
  Badge,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

const OverviewView = ({ environment }: ExtensionContextValue) => {
  const dashboardUrl = `https://dunningdog.com/app?ref=stripe-app`;

  return (
    <ContextView
      title="DunningDog Recovery"
      brandColor="#10b981"
      brandIcon={undefined}
      actions={
        <Link href={dashboardUrl} type="primary" target="_blank">
          Open Dashboard
        </Link>
      }
    >
      <Box
        css={{
          padding: "medium",
          stack: "y",
          gap: "medium",
        }}
      >
        <Box css={{ font: "heading" }}>Payment Recovery</Box>
        <Box css={{ font: "body", color: "secondary" }}>
          DunningDog automatically detects failed payments and sends smart
          recovery email sequences to win back lost revenue.
        </Box>

        <Box
          css={{
            padding: "medium",
            backgroundColor: "container",
            stack: "y",
            gap: "small",
          }}
        >
          <Box css={{ font: "subtitle" }}>Quick Actions</Box>
          <Link href={`${dashboardUrl}/recoveries`} target="_blank">
            View Active Recoveries
          </Link>
          <Link href={`${dashboardUrl}/sequences`} target="_blank">
            Manage Email Sequences
          </Link>
          <Link href={`${dashboardUrl}/settings`} target="_blank">
            Settings
          </Link>
        </Box>

        <Box css={{ font: "caption", color: "secondary" }}>
          Connected to DunningDog. Recovery emails are sent automatically when
          payments fail.
        </Box>
      </Box>
    </ContextView>
  );
};

export default OverviewView;
