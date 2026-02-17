// AI Detection Analytics & Monitoring System
// Performance tracking for StudXchange AI components

import { createClient } from '@supabase/supabase-js';

class AIDetectionAnalytics {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async logDetection(detectionData) {
    if (!process.env.ENABLE_DETECTION_ANALYTICS) return;
    
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        detection_method: detectionData.detection_method,
        dishes_found: detectionData.dishes_found,
        confidence_score: detectionData.confidence_score,
        processing_time_ms: this.parseProcessingTime(detectionData.processing_time),
        user_id: detectionData.user_id || 'anonymous',
        mess_id: detectionData.mess_id || null,
        success: detectionData.success,
        error_message: detectionData.error_message || null,
        model_version: detectionData.model_version,
        image_size_mb: detectionData.image_size_mb || 0,
        detected_dishes: JSON.stringify(detectionData.detected_dishes || [])
      };

      const { error } = await this.supabase
        .from('ai_detection_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Analytics logging failed:', error);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🤖 AI Detection Event:', {
          method: detectionData.detection_method,
          dishes: detectionData.dishes_found,
          confidence: detectionData.confidence_score,
          success: detectionData.success
        });
      }

    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  parseProcessingTime(timeString) {
    if (!timeString) return 0;
    const match = timeString.match(/(\d+\.?\d*)s/);
    return match ? parseFloat(match[1]) * 1000 : 0;
  }

  async getModelPerformance(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('ai_detection_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to fetch analytics:', error);
        return null;
      }

      return this.calculateMetrics(data);
    } catch (error) {
      console.error('Analytics query error:', error);
      return null;
    }
  }

  calculateMetrics(logs) {
    const metrics = {
      total_detections: logs.length,
      success_rate: 0,
      avg_processing_time: 0,
      avg_confidence: 0,
      avg_dishes_found: 0,
      model_breakdown: {},
      daily_stats: {}
    };

    if (logs.length === 0) return metrics;

    const successful = logs.filter(log => log.success);
    metrics.success_rate = (successful.length / logs.length) * 100;

    metrics.avg_processing_time = successful.reduce((sum, log) => sum + log.processing_time_ms, 0) / successful.length;
    metrics.avg_confidence = successful.reduce((sum, log) => sum + log.confidence_score, 0) / successful.length;
    metrics.avg_dishes_found = successful.reduce((sum, log) => sum + log.dishes_found, 0) / successful.length;

    logs.forEach(log => {
      const model = log.model_version || 'unknown';
      if (!metrics.model_breakdown[model]) {
        metrics.model_breakdown[model] = { count: 0, success: 0 };
      }
      metrics.model_breakdown[model].count++;
      if (log.success) metrics.model_breakdown[model].success++;
    });

    logs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (!metrics.daily_stats[date]) {
        metrics.daily_stats[date] = { detections: 0, successful: 0 };
      }
      metrics.daily_stats[date].detections++;
      if (log.success) metrics.daily_stats[date].successful++;
    });

    return metrics;
  }

  async sendToWebhook(data) {
    if (!process.env.ANALYTICS_WEBHOOK_URL) return;

    try {
      await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }
}

export function createAnalyticsLogger() {
  return new AIDetectionAnalytics();
}

export { AIDetectionAnalytics };