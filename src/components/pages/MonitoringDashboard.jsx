import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { orderService } from "@/services/api/orderService";
import { notificationService } from "@/services/api/notificationService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const MonitoringDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  const [slaAlerts, setSlaAlerts] = useState([]);
  const [verificationFailures, setVerificationFailures] = useState([]);
  const [discrepancyAlerts, setDiscrepancyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    loadMonitoringData();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        analyticsData,
        heatmap,
        productivity,
        slaData,
        failures,
        discrepancies
      ] = await Promise.all([
        orderService.getMonitoringAnalytics(),
        orderService.getVerificationHeatmap(),
        orderService.getModeratorProductivity(),
        orderService.getSLAAlerts(),
        orderService.getVerificationFailures(),
        orderService.getDiscrepancyAlerts()
      ]);
      
      setAnalytics(analyticsData);
      setHeatmapData(heatmap);
      setProductivityData(productivity);
      setSlaAlerts(slaData);
      setVerificationFailures(failures);
      setDiscrepancyAlerts(discrepancies);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAction = async (alertId, action) => {
    try {
      await orderService.resolveAlert(alertId, action);
      toast.success(`Alert ${action} successfully`);
      loadMonitoringData();
    } catch (err) {
      toast.error(`Failed to ${action} alert`);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="w-48 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          </div>
          <Loading type="cards" count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Error 
            message={error} 
            onRetry={loadMonitoringData}
            type="monitoring"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Real-time Monitoring Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor order verification, track performance metrics, and manage alerts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success-700 font-medium">Live</span>
            </div>
            <Button
              onClick={loadMonitoringData}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Dashboard Widgets */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Average Verification Time */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <ApperIcon name="Clock" className="w-6 h-6 text-white" />
                </div>
                <Badge variant="primary" size="sm">
                  {analytics.avgVerificationTime > analytics.targetTime ? 'Above Target' : 'On Target'}
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary-900 mb-1">
                  {formatTime(analytics.avgVerificationTime)}
                </h3>
                <p className="text-primary-700 text-sm font-medium mb-2">Average Verification Time</p>
                <div className="flex items-center space-x-2">
                  <ApperIcon 
                    name={analytics.avgVerificationTime <= analytics.targetTime ? "TrendingDown" : "TrendingUp"} 
                    className={`w-4 h-4 ${analytics.avgVerificationTime <= analytics.targetTime ? 'text-success' : 'text-warning'}`} 
                  />
                  <span className="text-xs text-primary-600">
                    Target: {formatTime(analytics.targetTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rejection Rate Analytics */}
            <div className="bg-gradient-to-br from-error-50 to-error-100 rounded-xl p-6 border border-error-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-error-500 rounded-full flex items-center justify-center">
                  <ApperIcon name="XCircle" className="w-6 h-6 text-white" />
                </div>
                <Badge variant="error" size="sm">
                  {analytics.rejectionRate > 0.1 ? 'High' : 'Normal'}
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-error-900 mb-1">
                  {formatPercentage(analytics.rejectionRate)}
                </h3>
                <p className="text-error-700 text-sm font-medium mb-2">Rejection Rate</p>
                <div className="flex items-center space-x-2">
                  <ApperIcon 
                    name={analytics.rejectionTrend === 'down' ? "TrendingDown" : "TrendingUp"} 
                    className={`w-4 h-4 ${analytics.rejectionTrend === 'down' ? 'text-success' : 'text-error'}`} 
                  />
                  <span className="text-xs text-error-600">
                    {analytics.rejectedToday} rejected today
                  </span>
                </div>
              </div>
            </div>

            {/* Orders Verified Today */}
            <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-6 border border-success-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center">
                  <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
                </div>
                <Badge variant="success" size="sm">
                  {analytics.verificationTrend === 'up' ? '+' : ''}{analytics.verificationChange}%
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-success-900 mb-1">
                  {analytics.verifiedToday}
                </h3>
                <p className="text-success-700 text-sm font-medium mb-2">Orders Verified Today</p>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Target" className="w-4 h-4 text-success-600" />
                  <span className="text-xs text-success-600">
                    Goal: {analytics.dailyTarget}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl p-6 border border-warning-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-warning-500 rounded-full flex items-center justify-center">
                  <ApperIcon name="AlertTriangle" className="w-6 h-6 text-white" />
                </div>
                <Badge variant="warning" size="sm">
                  {slaAlerts.length + verificationFailures.length + discrepancyAlerts.length > 5 ? 'Critical' : 'Normal'}
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-warning-900 mb-1">
                  {slaAlerts.length + verificationFailures.length + discrepancyAlerts.length}
                </h3>
                <p className="text-warning-700 text-sm font-medium mb-2">Active Alerts</p>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Bell" className="w-4 h-4 text-warning-600" />
                  <span className="text-xs text-warning-600">
                    {slaAlerts.length} SLA, {verificationFailures.length} failed, {discrepancyAlerts.length} discrepancies
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Verification Heatmap */}
        <div className="bg-surface rounded-xl shadow-premium p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Order Verification Heatmap
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success-200 rounded"></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning-300 rounded"></div>
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-error-400 rounded"></div>
                <span className="text-xs text-gray-600">High</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {heatmapData.map((day, index) => (
              <div key={index} className="space-y-2">
                {day.hours.map((hour, hourIndex) => (
                  <div
                    key={hourIndex}
                    className={`w-full h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                      hour.intensity === 'low' 
                        ? 'bg-success-200 text-success-800' 
                        : hour.intensity === 'medium'
                        ? 'bg-warning-300 text-warning-800'
                        : 'bg-error-400 text-error-900'
                    }`}
                    title={`${day.day} ${hour.hour}:00 - ${hour.count} orders`}
                  >
                    {hour.count}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Moderator Productivity Metrics */}
        <div className="bg-surface rounded-xl shadow-premium p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Moderator Productivity Metrics
            </h2>
            <Button variant="outline" size="sm">
              <ApperIcon name="Download" className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {productivityData.map((moderator) => (
              <div key={moderator.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{moderator.name}</h3>
                    <p className="text-sm text-gray-600">{moderator.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Orders Verified</span>
                    <span className="font-semibold text-gray-900">{moderator.ordersVerified}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Time</span>
                    <span className="font-semibold text-gray-900">{formatTime(moderator.avgTime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accuracy Rate</span>
                    <Badge variant={moderator.accuracyRate > 0.95 ? 'success' : 'warning'} size="sm">
                      {formatPercentage(moderator.accuracyRate)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={moderator.status === 'online' ? 'success' : 'secondary'} size="sm">
                      {moderator.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SLA Alerts */}
          <div className="bg-surface rounded-xl shadow-premium p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ApperIcon name="Clock" className="w-5 h-5 text-warning-600" />
              <h3 className="font-semibold text-gray-900">SLA Alerts ({slaAlerts.length})</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {slaAlerts.map((alert) => (
                <div key={alert.id} className="border border-warning-200 rounded-lg p-3 bg-warning-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-warning-900">Order #{alert.orderId}</span>
                    <Badge variant="warning" size="sm">
                      {alert.timeRemaining}
                    </Badge>
                  </div>
                  <p className="text-sm text-warning-700 mb-3">{alert.message}</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAlertAction(alert.id, 'escalate')}
                      variant="warning"
                      size="sm"
                    >
                      Escalate
                    </Button>
                    <Button
                      onClick={() => handleAlertAction(alert.id, 'resolve')}
                      variant="outline"
                      size="sm"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
              {slaAlerts.length === 0 && (
                <p className="text-center text-gray-600 py-4">No SLA alerts</p>
              )}
            </div>
          </div>

          {/* Verification Failures */}
          <div className="bg-surface rounded-xl shadow-premium p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ApperIcon name="XCircle" className="w-5 h-5 text-error-600" />
              <h3 className="font-semibold text-gray-900">Failed Verifications ({verificationFailures.length})</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {verificationFailures.map((failure) => (
                <div key={failure.id} className="border border-error-200 rounded-lg p-3 bg-error-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-error-900">Order #{failure.orderId}</span>
                    <Badge variant="error" size="sm">
                      {failure.failureType}
                    </Badge>
                  </div>
                  <p className="text-sm text-error-700 mb-3">{failure.reason}</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAlertAction(failure.id, 'retry')}
                      variant="error"
                      size="sm"
                    >
                      Retry
                    </Button>
                    <Button
                      onClick={() => handleAlertAction(failure.id, 'manual')}
                      variant="outline"
                      size="sm"
                    >
                      Manual Review
                    </Button>
                  </div>
                </div>
              ))}
              {verificationFailures.length === 0 && (
                <p className="text-center text-gray-600 py-4">No verification failures</p>
              )}
            </div>
          </div>

          {/* Discrepancy Warnings */}
          <div className="bg-surface rounded-xl shadow-premium p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ApperIcon name="AlertTriangle" className="w-5 h-5 text-info-600" />
              <h3 className="font-semibold text-gray-900">Discrepancies ({discrepancyAlerts.length})</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {discrepancyAlerts.map((discrepancy) => (
                <div key={discrepancy.id} className="border border-info-200 rounded-lg p-3 bg-info-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-info-900">Order #{discrepancy.orderId}</span>
                    <Badge variant="info" size="sm">
                      {discrepancy.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-info-700 mb-3">{discrepancy.description}</p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAlertAction(discrepancy.id, 'investigate')}
                      variant="info"
                      size="sm"
                    >
                      Investigate
                    </Button>
                    <Button
                      onClick={() => handleAlertAction(discrepancy.id, 'dismiss')}
                      variant="outline"
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
              {discrepancyAlerts.length === 0 && (
                <p className="text-center text-gray-600 py-4">No discrepancies found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;