import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ModelComparison = ({ results }) => {
  const getModelMetrics = (modelResults) => {
    if (!modelResults || modelResults.length === 0) return null;
    
    const anomalies = modelResults.filter(r => r.isAnomalous);
    const normal = modelResults.filter(r => !r.isAnomalous);
    
    const avgAnomalyScore = anomalies.length > 0 
      ? anomalies.reduce((sum, r) => sum + r.anomalyScore, 0) / anomalies.length 
      : 0;
    
    const avgNormalScore = normal.length > 0 
      ? normal.reduce((sum, r) => sum + r.anomalyScore, 0) / normal.length 
      : 0;
    
    return {
      totalDetected: anomalies.length,
      detectionRate: (anomalies.length / modelResults.length * 100).toFixed(1),
      avgAnomalyScore: avgAnomalyScore.toFixed(3),
      avgNormalScore: avgNormalScore.toFixed(3),
      separation: (avgAnomalyScore - avgNormalScore).toFixed(3)
    };
  };

  const comparisonData = [
    {
      model: 'Isolation Forest',
      detected: getModelMetrics(results.isolationForest)?.totalDetected || 0,
      rate: parseFloat(getModelMetrics(results.isolationForest)?.detectionRate || 0)
    },
    {
      model: 'One-Class SVM',
      detected: getModelMetrics(results.oneClassSVM)?.totalDetected || 0,
      rate: parseFloat(getModelMetrics(results.oneClassSVM)?.detectionRate || 0)
    },
    {
      model: 'Autoencoder',
      detected: getModelMetrics(results.autoencoder)?.totalDetected || 0,
      rate: parseFloat(getModelMetrics(results.autoencoder)?.detectionRate || 0)
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-blue-600">Detected: {payload[0].value} anomalies</p>
          <p className="text-sm text-green-600">Rate: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detection Comparison Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Anomalies Detected</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="detected" fill="#3b82f6" />
                  <Bar dataKey="rate" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Metrics Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
            <div className="space-y-4">
              {Object.entries(results).map(([modelKey, modelResults]) => {
                const metrics = getModelMetrics(modelResults);
                const modelName = modelKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                return (
                  <div key={modelKey} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{modelName}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Detected:</span>
                        <span className="ml-2 font-semibold">{metrics?.totalDetected || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rate:</span>
                        <span className="ml-2 font-semibold">{metrics?.detectionRate || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Anomaly Score:</span>
                        <span className="ml-2 font-semibold">{metrics?.avgAnomalyScore || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Separation:</span>
                        <span className="ml-2 font-semibold">{metrics?.separation || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelComparison;