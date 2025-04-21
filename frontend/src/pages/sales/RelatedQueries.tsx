import React, { useEffect, useRef, useState } from 'react'
import Text from '../../components/Text'
import Button from '../../components/Button'
import ExpandArrow from '../../assets/expand_arrow'
import { colors } from '../../utils/colors'

interface RelatedProps {
  onExpandClick: (value: boolean) => void
  relatedQuestions: any
}
type Expand = {
  status: boolean,
  value: number | undefined
}

const RelatedQueries: React.FC<RelatedProps> = ({ onExpandClick, relatedQuestions }) => {

  const queries: string[] = ['Create POS system', 'What is UX audit?', 'Create html game']
  //const queries: string[] = []
  const [expand, setExpand] = useState<Expand>({ status: false, value: undefined })
  const containerRef = useRef<HTMLDivElement>(null);


  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setExpand({ value: undefined, status: false });
      onExpandClick(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const onExpandIconClick = (key: number) => {
    if (key === expand.value) {
      setExpand({ value: undefined, status: false })
      onExpandClick(false)
    }
    else if (expand.value) {
      setExpand({ value: key, status: true })
      if (expand.status) {
        onExpandClick(true)
      }
    }
    else {
      setExpand({ value: key, status: !expand.status })
      onExpandClick(true)
    }
  }

  return (
    <div ref={containerRef} className='h-full'>
      <div className='flex flex-col relative item-center justify-center pt-[5.9074vh] mx-2'>
        <Text className='text-background pl-[2.1296vw] mb-2' type='bold-body'>Similar Questions</Text>
        {relatedQuestions?.length > 0 ? relatedQuestions?.map((item: any, key: number) =>
          <div key={key} className='flex flex-col border-none bg-[#373737] my-1 pl-[2vw] rounded-md max-h-[80vh]'>
            <div className='flex flex-row items-center justify-between w-full py-2 px-4'>
              {/* Question section */}
              <div className='flex-1'>
                {/* Show multiline question */}
                <Text type='small' className={`text-background ${expand.status === false && 'line-clamp-3'} `}>
                  {item?.question}
                </Text>
              </div>
              {/* Expand arrow */}
              <div className='flex items-center'>
                <ExpandArrow
                  className='cursor-pointer'
                  width='56'
                  height='56'
                  onClick={() => onExpandIconClick(key)}
                  // Conditional color based on expand.value
                  color={expand.value === key ? colors.danger : 'white'}
                />
              </div>
            </div>
            {/* Expanded answer section */}
            {expand.value === key && (
              <div className='px-4 pb-4'>
                {/* Show full question and answer */}
                <Text className='text-background' type='small'>
                  {item?.answer}
                </Text>
              </div>
            )}
          </div>
        ) :
          <Text type='small' className='text-white absolute top-56 left-16'>No similar questions</Text>
        }
      </div>
    </div>
  )
}

export default RelatedQueries

{/* <Loading related/> */ }

{/* <Button disabled className='border-none bg-[#373737] mx-[1vw] pl-[1vw] flex flex-row items-center justify-between w-[18.5vw] h-[8vh] py-1 my-1' size='custom' custom_type='secondary'>
        {item}
        <Button onClick={() => console.log("keri")} custom_type='secondary' className='border-none w-12 h-[2vh] mt-2' size='very_small' rounded>
          <ExpandArrow color={expand === key ? 'red' : 'white'}/>
        </Button>
      </Button>)} */}