/**
 * SkeletonLoader Component
 * 
 * Provides loading placeholders for various components throughout the app.
 * These skeletons improve perceived performance by showing loading states
 * that resemble the actual content being loaded.
 */
import React from 'react';
import { Skeleton, Card, Row, Col } from 'antd';

/**
 * Generic skeleton loader that can be configured for different components
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of skeleton to render (table, card, stats, chart)
 * @param {number} props.rows - Number of rows for table skeleton
 * @param {boolean} props.active - Whether the skeleton should have the active animation
 * @returns {JSX.Element} - Skeleton component based on the type
 */
const SkeletonLoader = ({ type = 'table', rows = 5, active = true }) => {
  switch (type) {
    case 'table':
      return (
        <div className="table-skeleton">
          <Skeleton.Input style={{ width: '100%', height: 40 }} active={active} />
          {Array(rows).fill(null).map((_, index) => (
            <Skeleton key={index} active={active} paragraph={{ rows: 1 }} title={false} />
          ))}
        </div>
      );
      
    case 'card':
      return (
        <Card>
          <Skeleton active={active} paragraph={{ rows: 4 }} />
        </Card>
      );
      
    case 'stats':
      return (
        <Card>
          <Row gutter={16}>
            <Col span={8}>
              <Skeleton.Input style={{ width: '100%', height: 60 }} active={active} />
            </Col>
            <Col span={8}>
              <Skeleton.Input style={{ width: '100%', height: 60 }} active={active} />
            </Col>
            <Col span={8}>
              <Skeleton.Input style={{ width: '100%', height: 60 }} active={active} />
            </Col>
          </Row>
        </Card>
      );
      
    case 'chart':
      return (
        <Card>
          <Skeleton.Input style={{ width: '100%', height: 40 }} active={active} />
          <Skeleton.Input style={{ width: '100%', height: 250, marginTop: 16 }} active={active} />
        </Card>
      );
      
    case 'filters':
      return (
        <Card>
          <Row gutter={16}>
            <Col span={8}>
              <Skeleton.Input style={{ width: '100%', height: 40 }} active={active} />
            </Col>
            <Col span={8}>
              <Skeleton.Input style={{ width: '100%', height: 40 }} active={active} />
            </Col>
            <Col span={8}>
              <Skeleton.Input style={{ width: '100%', height: 40 }} active={active} />
            </Col>
          </Row>
        </Card>
      );
      
    default:
      return <Skeleton active={active} />;
  }
};

export default SkeletonLoader;