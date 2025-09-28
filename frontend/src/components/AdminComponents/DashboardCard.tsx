import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: number | string
  growth?: number | null
  icon?: React.ReactNode
  loading?: boolean
  error?: string
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  growth,
  icon,
  loading = false,
  error
}) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val.toString()
  }

  const getGrowthColor = (growthValue?: number | null): string => {
    if (growthValue === undefined || growthValue === null) return 'text-gray-500'
    if (growthValue > 0) return 'text-green-600'
    if (growthValue < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getGrowthIcon = (growthValue?: number | null) => {
    if (growthValue === undefined || growthValue === null) return <Minus className="h-3 w-3" />
    if (growthValue > 0) return <TrendingUp className="h-3 w-3" />
    if (growthValue < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon && (
            <div className="animate-pulse">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border border-red-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">--</div>
          <p className="text-xs text-red-500 mt-1">
            Error loading data
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        {growth !== undefined && growth !== null && (
          <p className={`text-xs ${getGrowthColor(growth)} flex items-center mt-1`}>
            {getGrowthIcon(growth)}
            <span className="ml-1">
              {growth > 0 ? '+' : ''}{growth}% from last month
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}