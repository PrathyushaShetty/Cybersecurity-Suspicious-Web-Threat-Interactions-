import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AnomalyChart = ({ data, modelName }) => {
  // Prepare data for scatter plot
  const scatterData = data.map((item, index) => ({
    id: index,
    responseTime: item.responseTime,
    anomalyScore: item.anomalyScore,
    isAnomalous: item.isAnomalous,
    ip: item.ip,
    path: item.path,
    method: item.method,
    status: item.status
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.isAnomalous ? 'Anomalous' : 'Normal'} Request</p>
          <p className="text-sm text-gray-600">IP: {data.ip}</p>
          <p className="text-sm text-gray-600">Path: {data.path}</p>
          <p className="text-sm text-gray-600">Method: {data.method}</p>
          <p className="text-sm text-gray-600">Status: {data.status}</p>
          <p className="text-sm text-gray-600">Response Time: {data.responseTime.toFixed(2)}ms</p>
          <p className="text-sm text-gray-600">Anomaly Score: {data.anomalyScore.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Anomaly Detection Results - {modelName}
          <span className="text-sm font-normal text-gray-500">
            (Response Time vs Anomaly Score)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="responseTime" 
                type="number" 
                domain={['dataMin', 'dataMax']}
                name="Response Time"
                unit="ms"
              />
              <YAxis 
                dataKey="anomalyScore" 
                type="number" 
                domain={[0, 1]}
                name="Anomaly Score"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter dataKey="anomalyScore" fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isAnomalous ? '#ef4444' : '#22c55e'} 
                    fillOpacity={entry.isAnomalous ? 0.8 : 0.6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Anomalous Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full opacity-60"></div>
            <span className="text-sm text-gray-600">Normal Traffic</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnomalyChart;