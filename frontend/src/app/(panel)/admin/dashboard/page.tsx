import { Card, CardContent, CardHeader, CardTitle } from "@/app/(panel)/admin/components/ui/card"
import { DashboardCharts } from "@/app/(panel)/admin/components/dashboard-charts"
import { StatsCards } from "@/app/(panel)/admin/components/stats-cards"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <StatsCards />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">User Activity</h2>
          <DashboardCharts />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">System Performance</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm text-muted-foreground">
                  Last 30 Days <span className="text-green-600">+0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
