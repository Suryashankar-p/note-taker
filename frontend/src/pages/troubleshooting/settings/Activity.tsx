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
    return findPercentage(user?.question, totalQuestions).toString();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight + 2 >= scrollHeight) {
     reachedBottom()
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row lg:h-[24rem] sm:h-[48rem] h-[42rem] lg:flex-row xl:flex-row lg:py-6 py-1 justify-between px-4">
      {/* Chart Section */}
      <div className="w-full md:w-1/2 lg:w-[500px] h-[250px] md:h-[200px] lg:h-[300px] xl:h-[330px] relative -top-8 lg:top-4 lg:-left-4 xl:left-8">
        <Bar className="lg:px-4 px-1" options={options} data={data} />
      </div>

      {/* Top Users Section */}
      <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col top-1 relative justify-start items-between h-[300px] md:h-[150px] lg:h-[300px] overflow-y-auto" onScroll={handleScroll}>
        <Text className='mb-2 text-lg md:text-xl' type='header3'>Top Users</Text>
        {topUsers?.map((user: any, index: number) => (
          <div key={index} className="px-3 py-2 flex lg:items-center w-full max-w-sm md:max-w-md lg:max-w-xs">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gray-200 rounded-full lg:p-3 flex items-center justify-center mr-3">
              <span className="text-gray-600">{user && getInitials(user.name)}</span>
            </div>

            {/* User Info */}
            <div className="ml-3 overflow-hidden w-full">
              <Text type="small" className="text-primary_text">{user.name}</Text>
              <Text
                type="small"
                className="text-gray-500 max-w-60 text-[11px] block overflow-hidden text-ellipsis whitespace-nowrap"
                title={user.email}
              >
                {user.email}
              </Text>

              {/* Progress Bar */}
              <div title={`Total: ${totalQuestions}`} className="w-full bg-gray-200 h-4 mt-2 rounded-md overflow-hidden">
                <div 
                  title={`Asked: ${user?.question}`} 
                  className="bg-[#ffb1c1] rounded-r-md h-4 transition-all duration-300" 
                  style={{ width: `${widthPercentage(user)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
