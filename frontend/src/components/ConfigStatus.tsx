import React, { useState, useEffect } from 'react';
import { ConfigService } from '../services/api';

interface ConfigStatusProps {
  className?: string;
}

interface ConfigStatus {
  twitter: { configured: boolean; enabled: boolean };
  kimi: { configured: boolean; enabled: boolean };
}

export const ConfigStatus: React.FC<ConfigStatusProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const status = await ConfigService.getConfigStatus();
        console.log('前端获取到的配置状态:', status);
        setConfig(status);
      } catch (error) {
        console.error('获取配置状态失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className={`config-status ${className}`}>
        <div className="loading">检查配置状态...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className={`config-status ${className}`}>
        <div className="error">无法获取配置状态</div>
      </div>
    );
  }

  const getStatusIcon = (configured: boolean, enabled: boolean) => {
    if (configured && enabled) return '✅';
    if (configured && !enabled) return '⚠️';
    return '❌';
  };

  const getStatusText = (configured: boolean, enabled: boolean) => {
    if (!configured) return '未配置';
    if (configured && enabled) return '已配置 - 真实API';
    if (configured && !enabled) return '已配置 - 模拟API';
    return '未配置';
  };

  return (
    <div className={`config-status ${className}`}>
      <h3>🔧 系统配置状态</h3>
      <div className="config-items">
        <div className="config-item">
          <span className="config-name">Twitter API:</span>
          <span className="config-status-indicator">
            {getStatusIcon(config.twitter.configured, config.twitter.enabled)}
            {getStatusText(config.twitter.configured, config.twitter.enabled)}
          </span>
        </div>
        <div className="config-item">
          <span className="config-name">Kimi API:</span>
          <span className="config-status-indicator">
            {getStatusIcon(config.kimi.configured, config.kimi.enabled)}
            {getStatusText(config.kimi.configured, config.kimi.enabled)}
          </span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .config-status {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        
        .config-status h3 {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 16px;
        }
        
        .config-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .config-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }
        
        .config-name {
          font-weight: 500;
          color: #495057;
        }
        
        .config-status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        
        .loading, .error {
          text-align: center;
          padding: 20px;
          color: #6c757d;
        }
        
        .error {
          color: #dc3545;
        }
        `
      }} />
    </div>
  );
};

export default ConfigStatus;