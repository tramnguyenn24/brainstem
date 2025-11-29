"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * BarChartCard Component
 * A reusable bar chart component using recharts
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {string} props.dataKey - Key for X-axis data
 * @param {string|Array} props.bars - String for single bar or Array of bar configs
 * @param {string} props.title - Chart title
 * @param {string} props.xAxisLabel - X-axis label
 * @param {string} props.yAxisLabel - Y-axis label
 * @param {number} props.height - Chart height (default: 400)
 * @param {Object} props.colors - Color configuration
 * @param {(value: any, index: number) => string} props.yAxisFormatter - Custom formatter for Y-axis ticks
 * @param {(value: any, name: any, item: any, index: number, payload: any[]) => any} props.tooltipFormatter - Custom formatter for tooltip values
 * @param {boolean} props.hideXAxisLabels - Hide X-axis tick labels (default: false)
 */
export const BarChartCard = ({
  data = [],
  dataKey = 'name',
  bars = 'value',
  title,
  xAxisLabel,
  yAxisLabel,
  height = 400,
  colors = {
    primary: '#727cf5',
    secondary: '#4ecdc4',
    tertiary: '#f9ca24'
  },
  yAxisFormatter,
  tooltipFormatter,
  hideXAxisLabels = false
}) => {
  // Normalize bars to array format
  const barsConfig = Array.isArray(bars) ? bars : [{ dataKey: bars, name: bars, color: colors.primary }];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      border: '1px solid #4b5563',
      borderRadius: '16px',
      padding: '24px'
    }}>
      {title && (
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '20px',
          color: '#dee2e6'
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis
            dataKey={dataKey}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            tick={!hideXAxisLabels}
            label={xAxisLabel && !hideXAxisLabels ? { value: xAxisLabel, position: 'insideBottom', offset: -10, style: { fill: '#9ca3af' } } : undefined}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            {...(yAxisFormatter ? { tickFormatter: yAxisFormatter } : {})}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } } : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#dee2e6'
            }}
            labelStyle={{ color: '#9ca3af' }}
            {...(tooltipFormatter ? { formatter: tooltipFormatter } : {})}
          />
          <Legend
            wrapperStyle={{ color: '#dee2e6', paddingTop: '20px' }}
          />
          {barsConfig.map((bar, index) => (
            <Bar
              key={bar.dataKey || index}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color || colors.primary}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartCard;

