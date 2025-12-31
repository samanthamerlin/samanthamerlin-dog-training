import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check Your Email</CardTitle>
        <CardDescription className="text-base">
          We've sent you a magic link to sign in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Click the link in the email to access your account. The link will expire in 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{" "}
          <a href="/login" className="text-primary hover:underline">
            try again
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}
