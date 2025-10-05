'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Listing {
  _id: string;
  address: string;
  price: number;
  sqft: number;
}

interface ComparisonChartProps {
  listings: Listing[];
}

export default function ComparisonChart({ listings }: ComparisonChartProps) {
  const data = {
    labels: listings.map((l) => l.address.split(',')[0]),
    datasets: [
      {
        label: 'Price ($)',
        data: listings.map((l) => l.price),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Price per sqft ($)',
        data: listings.map((l) => Math.round(l.price / l.sqft)),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price & Value Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price & Value Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
