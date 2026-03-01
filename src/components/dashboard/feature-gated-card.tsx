import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureGatedCardProps {
  title: string;
  description: string;
  requiredPlanLabel: string;
  hasFeature: boolean;
  children: React.ReactNode;
}

export function FeatureGatedCard({
  title,
  description,
  requiredPlanLabel,
  hasFeature,
  children,
}: FeatureGatedCardProps) {
  return (
    <Card className={hasFeature ? "" : "relative"}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {!hasFeature && (
            <Badge variant="warning">{requiredPlanLabel}</Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={hasFeature ? "" : "pointer-events-none opacity-50"}>
        {children}
      </CardContent>
    </Card>
  );
}
