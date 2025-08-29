import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnomalyChart from './charts/AnomalyChart';
import TrafficPatterns from './charts/TrafficPatterns';
import ModelComparison from './ModelComparison';
import DetectionResults from './DetectionResults';
import { 
  generateTrafficData, 
  IsolationForest, 
  OneClassSVM, 
  SimpleAutoencoder,
  analyzeTrafficPatterns 
} from '../data/trafficData';
import { AlertTriangle, Shield, Activity, TrendingUp } from 'lucide-react';

const TrafficAnalysis = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState({});
  const [patterns, setPatterns] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('isolation-forest');

  useEffect(() => {
    // Generate initial traffic data
    const data = generateTrafficData(1000);
    setTrafficData(data);
    setPatterns(analyzeTrafficPatterns(data));
    
    // Auto-run analysis on initial load for better UX
    setTimeout(() => {
      runAnomalyDetection(data);
    }, 500);
  }, []);

  const runAnomalyDetection = async (dataToAnalyze = trafficData) => {
    setIsAnalyzing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = {};
    
    console.log('Running anomaly detection on', dataToAnalyze.length, 'records');
    
    // Isolation Forest
    const isolationForest = new IsolationForest();
    isolationForest.fit(dataToAnalyze);
    results.isolationForest = isolationForest.predict(dataToAnalyze);
    console.log('Isolation Forest detected:', results.isolationForest.filter(r => r.isAnomalous).length, 'anomalies');
    
    // One-Class SVM
    const oneClassSVM = new OneClassSVM();
    oneClassSVM.fit(dataToAnalyze);
    results.oneClassSVM = oneClassSVM.predict(dataToAnalyze);
    console.log('One-Class SVM detected:', results.oneClassSVM.filter(r => r.isAnomalous).length, 'anomalies');
    
    // Autoencoder
    const autoencoder = new SimpleAutoencoder();
    autoencoder.fit(dataToAnalyze);
    results.autoencoder = autoencoder.predict(dataToAnalyze);
    console.log('Autoencoder detected:', results.autoencoder.filter(r => r.isAnomalous).length, 'anomalies');
    
    setAnalysisResults(results);
    setIsAnalyzing(false);
  };

  const getModelStats = (modelResults) => {
    if (!modelResults) return { total: 0, anomalies: 0, normal: 0, anomalyRate: '0.0' };
    
    const anomalies = modelResults.filter(r => r.isAnomalous).length;
    return {
      total: modelResults.length,
      anomalies,
      normal: modelResults.length - anomalies,
      anomalyRate: ((anomalies / modelResults.length) * 100).toFixed(1)
    };
  };

  // Get initial stats from raw traffic data if no analysis results yet
  const getInitialStats = () => {
    if (trafficData.length === 0) return { total: 0, anomalies: 0, normal: 0, anomalyRate: '0.0' };
    
    const anomalies = trafficData.filter(r => r.isAnomaly).length;
    return {
      total: trafficData.length,
      anomalies,
      normal: trafficData.length - anomalies,
      anomalyRate: ((anomalies / trafficData.length) * 100).toFixed(1)
    };
  };

  const currentResults = analysisResults[selectedModel.replace('-', '')] || [];
  const stats = currentResults.length > 0 ? getModelStats(currentResults) : getInitialStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Web Traffic Anomaly Detection</h1>
          <p className="text-gray-600 mt-2">
            Detect malicious and suspicious patterns in web traffic using machine learning
          </p>
        </div>
        <Button 
          onClick={() => runAnomalyDetection()}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              {Object.keys(analysisResults).length > 0 ? 'Re-run Analysis' : 'Run Analysis'}
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detected Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.anomalies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.anomalyRate}% of total traffic
              {currentResults.length === 0 && trafficData.length > 0 && (
                <span className="block text-blue-600">Click "Run Analysis" for ML detection</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal Traffic</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - parseFloat(stats.anomalyRate)).toFixed(1)}% legitimate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(trafficData.map(d => d.ip)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Distinct sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Selection */}
      {Object.keys(analysisResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Detection Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'isolation-forest', label: 'Isolation Forest', color: 'bg-blue-100 text-blue-800' },
                { key: 'one-class-svm', label: 'One-Class SVM', color: 'bg-green-100 text-green-800' },
                { key: 'autoencoder', label: 'Autoencoder', color: 'bg-purple-100 text-purple-800' }
              ].map(model => (
                <Badge
                  key={model.key}
                  variant={selectedModel === model.key ? "default" : "secondary"}
                  className={`cursor-pointer ${selectedModel === model.key ? '' : model.color}`}
                  onClick={() => setSelectedModel(model.key)}
                >
                  {model.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficPatterns patterns={patterns} />
        {currentResults.length > 0 && (
          <AnomalyChart 
            data={currentResults} 
            modelName={selectedModel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          />
        )}
      </div>

      {/* Model Comparison */}
      {Object.keys(analysisResults).length > 0 && (
        <ModelComparison results={analysisResults} />
      )}

      {/* Detection Results */}
      {currentResults.length > 0 && (
        <DetectionResults 
          results={currentResults.filter(r => r.isAnomalous).slice(0, 20)}
          modelName={selectedModel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        />
      )}
      
      {/* Show initial anomalies before ML analysis */}
      {currentResults.length === 0 && trafficData.length > 0 && (
        <DetectionResults 
          results={trafficData.filter(r => r.isAnomaly).slice(0, 20).map(r => ({
            ...r,
            anomalyScore: 0.8, // Default score for display
            isAnomalous: true
          }))}
          modelName="Initial Pattern Detection"
        />
      )}
    </div>
  );
};

export default TrafficAnalysis;