import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-3xl">Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your application preferences and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings page is under construction. Check back later for more options!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
