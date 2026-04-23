import {
  Box,
  ContextView,
  Link,
  Badge,
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";

const PaymentDetailView = ({
  environment,
}: ExtensionContextValue) => {
  const dashboardUrl = `https://dunningdog.com/app?ref=stripe-app`;

  return (
    <ContextView
      title="DunningDog Recovery"
      brandColor="#10b981"
    >
      <Box
        css={{
          padding: "medium",
          stack: "y",
          gap: "medium",
        }}
      >
        <Box css={{ font: "body", color: "secondary" }}>
          If this payment has failed, DunningDog can automatically send recovery
          emails to the customer to update their payment method.
        </Box>

        <Box
          css={{
            padding: "medium",
            backgroundColor: "container",
            stack: "y",
            gap: "small",
          }}
        >
          <Box css={{ font: "subtitle" }}>Recovery Status</Box>
          <Box css={{ font: "body" }}>
            <Badge type="positive">Monitoring Active</Badge>
          </Box>
          <Box css={{ font: "caption", color: "secondary" }}>
            Failed payments are automatically detected and recovery sequences
            are triggered.
          </Box>
        </Box>

        <Link href={`${dashboardUrl}/recoveries`} type="primary" target="_blank">
          View Recovery Details
        </Link>
      </Box>
    </ContextView>
  );
};

export default PaymentDetailView;
