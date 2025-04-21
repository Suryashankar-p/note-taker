import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import Text from '../../../components/Text';
import { findPercentage, roundToFourDecimals } from '../../../utils/functions';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../../redux/store';
import EditLimitModal from '../../../components/Modals/EditLimit';
import { months } from '../../../utils/constants';
import { useEffect, useRef, useState } from 'react';

// Register chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Cost({ usageData, limit, onLimitEdit, month }: any) {

    const totalCost = usageData?.total ? roundToFourDecimals(usageData?.total) : 0;
    const dispatch = useDispatch<Dispatch>();
    const editLimit = useSelector((state: RootState) => state.modal.editLimit);
    const percentage = findPercentage(totalCost, limit);
    const startDate = usageData?.day[0] || 'N/A';
    const endDate = usageData?.day.length > 0 ? usageData?.day[usageData?.day.length - 1] : 'N/A';
    const member = useSelector((state: RootState) => state.memberRole);
    const doctorConBotMemberDetails = member.service === 'doctor_conbot' ? member?.details : {};

    // Doughnut chart options
    const donutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        radius: 100,
        cutout: '60%', // Adjust the cutout percentage to reduce the doughnut width
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: (startDate !== 'N/A' && endDate !== 'N/A') ? `Monthly bill ${months[month - 1]} ${startDate} - ${endDate}` : 'N/A',
            },
        },
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                display: false
            },
            title: {
                display: true,
                text: `Monthly Spend $ ${totalCost}`,
            },
            tooltip: {
                callbacks: {
                    // Customize the tooltip title
                    title: (tooltipItems: any) => {
                        // Assuming the x-axis labels are dates, you can customize the title
                        const date = tooltipItems[0].label + " " + months[month - 1];
                        return `Date: ${date}`;
                    },
                    // Customize the tooltip label
                    label: (tooltipItem: any) => {
                        // Tooltip item represents the data point
                        const value = (tooltipItem.raw).toFixed(4);
                        return `Cost: $${value}`;
                    },
                    // Customize the tooltip footer (optional)
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: `Days of ${months[month - 1]}`,
                    font: {
                        size: 14,
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Cost in $',
                    font: {
                        size: 14,
                    },
                },
                beginAtZero: true,
            },
        },
    };

    const data = {
        labels: usageData?.day,
        datasets: [
            {
                label: 'Cost',
                data: usageData?.cost,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const donutData = {
        labels: ['Used', 'Remaining'],
        datasets: [
            {
                label: 'Cost',
                data: [totalCost, limit - totalCost],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(200, 200, 200, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(200, 200, 200, 1)',
                ],
                borderWidth: 1,
            },
        ],

    };

    return (
        <div className='flex h-full py-6 justify-between px-4 flex-row'>
            {editLimit && (
                <div>
                    <EditLimitModal defaultValue={limit} onSubmit={onLimitEdit} />
                </div>
            )}
            <div className='w-2/3 relative '>
                <Bar width={100} height={50} className='px-4' options={options} data={data} />
            </div>
            <div className='w-1/2 flex relative justify-center items-center'>
                <Doughnut width={50} height={100} data={donutData} options={donutOptions} className=' absolute right-16' />
                <div
                    className='absolute top-[10.5rem] left-[90px] flex self-center justify-center items-center text-center text-primary_text w-[100px]'                >
                    <Text type='header3'>{percentage}%</Text>
                </div>
                <div className='absolute flex flex-col ml-4 top-70 items-center right-2'>
                    <Text type='header2'>${totalCost}</Text>
                    <Text className='text-primary_text' type='body'>/${limit} limit</Text>
                    {doctorConBotMemberDetails?.role === 'OWNER' && <button onClick={() => dispatch.modal.openEditLimit()} className='bg-danger rounded-lg p-2 m-2'>
                        <Text className='text-white' type='body'>Increase Limit</Text>
                    </button>}
                </div>
            </div>
        </div>
    );
}
