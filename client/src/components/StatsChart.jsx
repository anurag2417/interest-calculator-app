import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatsChart = ({ given, taken }) => {
    
    const data = {
        labels: ['Given (Lent)', 'Taken (Borrowed)'],
        datasets: [
            {
                label: 'Amount (₹)',
                data: [given, taken],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)', // Green for Given
                    'rgba(255, 99, 132, 0.6)', // Red for Taken
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Financial Distribution',
            },
        },
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h3>Portfolio Breakdown</h3>
            {given === 0 && taken === 0 ? (
                <p style={{color: '#888'}}>No data to display yet.</p>
            ) : (
                <Pie data={data} options={options} />
            )}
        </div>
    );
};

export default StatsChart;