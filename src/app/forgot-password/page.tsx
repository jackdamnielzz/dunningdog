import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AuthPageLayout } from "@/components/layouts/auth-page-layout";

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout>
      <Card>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we will send a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}
