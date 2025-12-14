"use client";

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * ComboChartCard Component
 * A reusable combo chart component (bar + line) using recharts
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {string} props.dataKey - Key for X-axis data
 * @param {Array} props.bars - Array of bar configs with stack property
 * @param {Array} props.lines - Array of line configs
 * @param {string} props.title - Chart title
 * @param {string} props.xAxisLabel - X-axis label
 * @param {string} props.yAxisLabel - Y-axis label
 * @param {number} props.height - Chart height (default: 400)
 * @param {Object} props.colors - Color configuration
 * @param {(e: any) => void} [props.onLegendClick] - Optional legend click handler
 * @param {Array} [props.selectedCampaigns] - Optional filter of selected campaign keys
 */
export const ComboChartCard = ({
  data = [],
  dataKey = 'name',
  bars = [],
  lines = [],
  title,
  xAxisLabel,
  yAxisLabel,
  height = 400,
  colors = {
    primary: '#4ecdc4',
    secondary: '#727cf5',
    tertiary: '#f9ca24'
  },
  onLegendClick,
  selectedCampaigns = []
}) => {
  // Default bars if not provided
  const barsConfig = bars.length > 0 ? bars : [
    { dataKey: 'value1', name: 'Value 1', color: colors.primary, stackId: 'stack' },
    { dataKey: 'value2', name: 'Value 2', color: colors.secondary, stackId: 'stack' }
  ];

  // Default lines if not provided
  const linesConfig = lines.length > 0 ? lines : [
    { dataKey: 'total', name: 'Total', color: colors.tertiary, strokeWidth: 2 }
  ];

  // Filter bars if selectedCampaigns is provided
  const visibleBars = selectedCampaigns.length > 0
    ? barsConfig.filter(bar => selectedCampaigns.includes(bar.dataKey))
    : barsConfig;

  return (
    <div style={{
      width: '100%'
    }}>
      {title && (
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#dee2e6'
        }}>
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis
            dataKey={dataKey}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 11, fill: '#aab8c5', dy: 5 }}
            label={{
              value: xAxisLabel,
              position: 'insideBottom',
              offset: -10,
              fill: '#aab8c5',
              fontSize: 12
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#aab8c5' }}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              fill: '#aab8c5',
              fontSize: 12
            }}
          />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#dee2e6'
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            onClick={onLegendClick}
            iconType="rect"
          />

          {/* Render Bars */}
          {visibleBars.map((bar, index) => (
            <Bar
              key={`bar-${index}`}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={bar.stackId}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              yAxisId="left"
            />
          ))}

          {/* Render Lines */}
          {linesConfig.map((line, index) => (
            <Line
              key={`line-${index}`}
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              dot={{ fill: line.color, r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              yAxisId="left"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
