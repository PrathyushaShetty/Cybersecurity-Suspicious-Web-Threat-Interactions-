// Mock web traffic data and anomaly detection utilities
import { format, subHours, addMinutes } from 'date-fns';

// Generate mock web traffic data
export const generateTrafficData = (count = 1000) => {
  const data = [];
  const baseTime = new Date();
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const statusCodes = [200, 201, 301, 302, 400, 401, 403, 404, 500, 502, 503];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'curl/7.68.0',
    'python-requests/2.25.1',
    'Googlebot/2.1',
    'suspicious-bot/1.0',
    'scanner/malicious'
  ];

  for (let i = 0; i < count; i++) {
    const timestamp = addMinutes(subHours(baseTime, Math.random() * 24), Math.random() * 60);
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const responseTime = Math.random() * 5000;
    const bytes = Math.floor(Math.random() * 100000);
    
    // Create some anomalous patterns
    const isAnomaly = Math.random() < 0.1; // 10% anomalies
    const requestsPerMinute = isAnomaly ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 10) + 1;
    const path = isAnomaly ? 
      ['/admin', '/wp-admin', '/.env', '/config', '/backup', '/shell.php'][Math.floor(Math.random() * 6)] :
      ['/', '/home', '/about', '/contact', '/products', '/api/data'][Math.floor(Math.random() * 6)];

    data.push({
      id: i,
      timestamp: timestamp.toISOString(),
      ip,
      method,
      path,
      status,
      userAgent,
      responseTime,
      bytes,
      requestsPerMinute,
      isAnomaly
    });
  }

  return data;
};

// Isolation Forest implementation (simplified)
export class IsolationForest {
  constructor(nTrees = 100, maxSamples = 256) {
    this.nTrees = nTrees;
    this.maxSamples = maxSamples;
    this.trees = [];
  }

  fit(data) {
    this.trees = [];
    for (let i = 0; i < this.nTrees; i++) {
      const sample = this.sampleData(data, this.maxSamples);
      const tree = this.buildTree(sample, 0, Math.log2(this.maxSamples));
      this.trees.push(tree);
    }
  }

  predict(data) {
    return data.map(point => {
      const avgPathLength = this.trees.reduce((sum, tree) => {
        return sum + this.getPathLength(point, tree, 0);
      }, 0) / this.trees.length;
      
      const score = Math.pow(2, -avgPathLength / this.cFactor(this.maxSamples));
      return { ...point, anomalyScore: score, isAnomalous: score > 0.6 };
    });
  }

  sampleData(data, size) {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(size, data.length));
  }

  buildTree(data, depth, maxDepth) {
    if (depth >= maxDepth || data.length <= 1) {
      return { size: data.length, isLeaf: true };
    }

    const features = ['responseTime', 'bytes', 'requestsPerMinute'];
    const feature = features[Math.floor(Math.random() * features.length)];
    const values = data.map(d => d[feature]).filter(v => v !== undefined);
    
    if (values.length === 0) return { size: data.length, isLeaf: true };
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const splitValue = min + Math.random() * (max - min);

    const left = data.filter(d => d[feature] < splitValue);
    const right = data.filter(d => d[feature] >= splitValue);

    return {
      feature,
      splitValue,
      left: this.buildTree(left, depth + 1, maxDepth),
      right: this.buildTree(right, depth + 1, maxDepth),
      isLeaf: false
    };
  }

  getPathLength(point, tree, depth) {
    if (tree.isLeaf) {
      return depth + this.cFactor(tree.size);
    }

    if (point[tree.feature] < tree.splitValue) {
      return this.getPathLength(point, tree.left, depth + 1);
    } else {
      return this.getPathLength(point, tree.right, depth + 1);
    }
  }

  cFactor(n) {
    if (n <= 1) return 0;
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
  }
}

// One-Class SVM implementation (simplified)
export class OneClassSVM {
  constructor(nu = 0.1, gamma = 0.1) {
    this.nu = nu;
    this.gamma = gamma;
  }

  fit(data) {
    // Simplified implementation - calculate mean and std for each feature
    this.features = ['responseTime', 'bytes', 'requestsPerMinute'];
    this.stats = {};
    
    this.features.forEach(feature => {
      const values = data.map(d => d[feature]).filter(v => v !== undefined);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      this.stats[feature] = { mean, std };
    });
  }

  predict(data) {
    return data.map(point => {
      let distance = 0;
      this.features.forEach(feature => {
        const normalized = (point[feature] - this.stats[feature].mean) / this.stats[feature].std;
        distance += Math.pow(normalized, 2);
      });
      
      distance = Math.sqrt(distance);
      const score = Math.exp(-this.gamma * Math.pow(distance, 2));
      
      return { ...point, anomalyScore: 1 - score, isAnomalous: score < 0.5 };
    });
  }
}

// Simple Autoencoder simulation
export class SimpleAutoencoder {
  constructor(threshold = 0.7) {
    this.threshold = threshold;
  }

  fit(data) {
    // Calculate feature statistics for reconstruction error simulation
    this.features = ['responseTime', 'bytes', 'requestsPerMinute'];
    this.stats = {};
    
    this.features.forEach(feature => {
      const values = data.map(d => d[feature]).filter(v => v !== undefined);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      
      this.stats[feature] = { mean, variance };
    });
  }

  predict(data) {
    return data.map(point => {
      let reconstructionError = 0;
      
      this.features.forEach(feature => {
        const deviation = Math.abs(point[feature] - this.stats[feature].mean);
        const normalizedError = deviation / Math.sqrt(this.stats[feature].variance);
        reconstructionError += normalizedError;
      });
      
      reconstructionError /= this.features.length;
      const score = Math.min(reconstructionError / 3, 1); // Normalize to [0,1]
      
      return { ...point, anomalyScore: score, isAnomalous: score > this.threshold };
    });
  }
}

// Analyze traffic patterns
export const analyzeTrafficPatterns = (data) => {
  const hourlyTraffic = {};
  const ipFrequency = {};
  const statusCodeDist = {};
  const methodDist = {};
  
  data.forEach(record => {
    const hour = new Date(record.timestamp).getHours();
    hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
    
    ipFrequency[record.ip] = (ipFrequency[record.ip] || 0) + 1;
    statusCodeDist[record.status] = (statusCodeDist[record.status] || 0) + 1;
    methodDist[record.method] = (methodDist[record.method] || 0) + 1;
  });
  
  return {
    hourlyTraffic: Object.entries(hourlyTraffic).map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    })),
    topIPs: Object.entries(ipFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count })),
    statusCodes: Object.entries(statusCodeDist).map(([code, count]) => ({
      code: parseInt(code),
      count
    })),
    methods: Object.entries(methodDist).map(([method, count]) => ({
      method,
      count
    }))
  };
};