import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { AuthPageLayout } from "@/components/layouts/auth-page-layout";

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout>
      <Card>
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Set a new password for your DunningDog account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}
