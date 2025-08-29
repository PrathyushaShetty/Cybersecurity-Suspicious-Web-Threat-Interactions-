import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, EyeOff, Globe, Clock, Activity } from 'lucide-react';

const DetectionResults = ({ results, modelName }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState('anomalyScore');

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'anomalyScore') return b.anomalyScore - a.anomalyScore;
    if (sortBy === 'responseTime') return b.responseTime - a.responseTime;
    if (sortBy === 'timestamp') return new Date(b.timestamp) - new Date(a.timestamp);
    return 0;
  });

  const getSeverityColor = (score) => {
    if (score >= 0.8) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 0.6) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getSeverityLabel = (score) => {
    if (score >= 0.8) return 'High Risk';
    if (score >= 0.6) return 'Medium Risk';
    return 'Low Risk';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getThreatIndicators = (record) => {
    const indicators = [];
    
    if (record.path.includes('admin') || record.path.includes('wp-admin')) {
      indicators.push('Admin Path Access');
    }
    if (record.path.includes('.env') || record.path.includes('config')) {
      indicators.push('Config File Access');
    }
    if (record.userAgent.includes('bot') || record.userAgent.includes('scanner')) {
      indicators.push('Suspicious User Agent');
    }
    if (record.requestsPerMinute > 30) {
      indicators.push('High Request Rate');
    }
    if (record.status >= 400) {
      indicators.push('Error Response');
    }
    if (record.responseTime > 3000) {
      indicators.push('Slow Response');
    }
    
    return indicators;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Detected Anomalies - {modelName}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Top {results.length} suspicious requests requiring investigation
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="anomalyScore">Anomaly Score</option>
              <option value="responseTime">Response Time</option>
              <option value="timestamp">Timestamp</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedResults.map((record, index) => {
            const threatIndicators = getThreatIndicators(record);
            
            return (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(record.anomalyScore)}>
                      {getSeverityLabel(record.anomalyScore)}
                    </Badge>
                    <span className="font-mono text-sm text-gray-600">{record.ip}</span>
                    <Badge variant="outline" className="text-xs">
                      Score: {record.anomalyScore.toFixed(3)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    #{index + 1}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-semibold">{record.method}</span> {record.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Status: <span className={`font-semibold ${record.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                        {record.status}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {record.responseTime.toFixed(0)}ms
                    </span>
                  </div>
                </div>

                {threatIndicators.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {threatIndicators.map((indicator, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {showDetails && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="ml-2">{formatTimestamp(record.timestamp)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Requests/min:</span>
                        <span className="ml-2 font-semibold">{record.requestsPerMinute}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">User Agent:</span>
                        <span className="ml-2 font-mono text-xs break-all">{record.userAgent}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No anomalies detected in the current dataset.</p>
            <p className="text-sm mt-1">This could indicate normal traffic patterns or model parameters may need adjustment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetectionResults;