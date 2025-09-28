import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface ChartDataPoint {
  [key: string]: string | number
}

interface DashboardChartProps {
  title: string
  data: ChartDataPoint[]
  type: 'area' | 'bar' | 'line' | 'pie'
  loading?: boolean
  error?: string
  xKey?: string
  yKey?: string
  actions?: React.ReactNode
  height?: number
}

export const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  data,
  type,
  loading = false,
  error,
  xKey = 'name',
  yKey = 'value',
  actions,
  height = 300
}) => {
  const colors = ['#535c91', '#6b7aa3', '#8390b5', '#9ba5c7', '#b3bad9']

  const renderChart = () => {
    console.log('DashboardChart - renderChart called with data:', data);
    console.log('DashboardChart - data length:', data?.length);
    console.log('DashboardChart - chart type:', type);
    
    if (!data || data.length === 0) {
      console.log('DashboardChart - No data, showing empty state');
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      )
    }

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xKey} 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#374151' }}
                formatter={(value: any) => [value, 'Count']}
              />
              <Area 
                type="monotone" 
                dataKey={yKey} 
                stroke="#535c91" 
                fill="url(#colorGradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#535c91" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#535c91" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xKey} 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
                formatter={(value: any) => [value, 'Count']}
              />
              <Bar dataKey={yKey} fill="#535c91" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xKey} 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
                formatter={(value: any) => [value, 'Count']}
              />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke="#535c91" 
                strokeWidth={3}
                dot={{ fill: '#535c91', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#535c91', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [value, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Unsupported chart type</div>
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {actions}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className={`bg-gray-200 rounded`} style={{ height }}>
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading chart...</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border border-red-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-red-600">{title}</CardTitle>
          {actions}
        </CardHeader>
        <CardContent>
          <div className={`flex items-center justify-center bg-red-50 rounded`} style={{ height }}>
            <div className="text-center">
              <p className="text-red-600 font-medium">Error loading chart</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {actions}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}