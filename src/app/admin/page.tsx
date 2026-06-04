import { connectDB } from "@/lib/db/mongodb";
import { Product } from "@/lib/db/models/Product";
import { User } from "@/lib/db/models/User";
import { Alert } from "@/lib/db/models/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();
  const [productCount, userCount, alertCount] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Alert.countDocuments({ isActive: true }),
  ]);
  return { productCount, userCount, alertCount };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.productCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.alertCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
