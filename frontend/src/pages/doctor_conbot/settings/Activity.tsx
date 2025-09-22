import { Bar } from 'react-chartjs-2';
import Text from '../../../components/Text';
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
import { months } from '../../../utils/constants';
import { findPercentage, getInitials } from '../../../utils/functions';

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

interface Props {
  activityData: any;
  month: any;
  topUsers: any;
  reachedBottom: () => void;
}

export default function Activity({ activityData, month, topUsers, reachedBottom }: Props) {
  const totalQuestions = activityData?.total;

  const data = {
    labels: activityData?.day,
    datasets: [
      {
        label: 'Questions',
        data: activityData?.question,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
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
        text: `Monthly questions: ${totalQuestions ? totalQuestions : 0}`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            // Assuming the x-axis labels are dates, you can customize the title
            const date = tooltipItems[0].label + " " + months[month - 1];
            return `Date: ${date}`;
        },
        }
      }
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
          text: 'No. of questions',
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
      },
    },
  };

  const widthPercentage = (user: any) => {
    return findPercentage(user?.question, totalQuestions).toString()
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight + 2 >= scrollHeight) {
      reachedBottom()
    }
  };  


  return (
    <div className='flex justify-between h-full py-6 px-4'>
      <div className='w-2/3'>
        <Bar height={50} width={100} className='px-4' options={options} data={data} />
      </div>
      <div className='w-1/2 flex flex-col justify-start items-center overflow-y-auto' onScroll={handleScroll}>
        <Text className='mb-1' type='header3'>Top Users</Text>
        {topUsers?.map((user: any, index: number) => (
          <div key={index} className="px-3 xl:py-4 py-2 flex items-center w-full max-w-xs">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <span className="text-gray-600">{user && getInitials(user.name)}</span>
            </div>
            <div className="ml-3 overflow-hidden">
              <Text type="small" className="text-primary_text">{user.name}</Text>
              <Text
                type="small"
                className="text-gray-500 max-w-60 text-[11px] block overflow-hidden text-ellipsis whitespace-nowrap"
                title={user.email}
              >
                {user.email}
              </Text>
              <div title={`Total: ${totalQuestions}`} className="w-full cursor-pointer bg-gray-200 h-4 mt-2">
                <div title={`Asked: ${user?.question}`} className="bg-[#ffb1c1] rounded-r-md h-4 " style={{ width: `${widthPercentage(user)}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
