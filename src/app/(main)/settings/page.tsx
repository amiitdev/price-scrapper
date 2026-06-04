"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui";
import { Bell, Shield, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Appearance</CardTitle>
          </div>
          <CardDescription>Customize your theme and display preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose between dark and light mode</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Notifications</CardTitle>
          </div>
          <CardDescription>Manage your alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive price drop alerts via email</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alert Threshold</p>
              <p className="text-xs text-muted-foreground">Minimum price drop percentage to trigger alerts</p>
            </div>
            <div className="flex items-center gap-2">
              <Input className="w-20 h-8 text-sm" defaultValue="5" type="number" />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">API Keys</p>
              <p className="text-xs text-muted-foreground">Manage your API access keys</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
