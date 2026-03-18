import React, { useEffect, useRef, useState } from 'react'
import Text from '../../components/Text'
import Button from '../../components/Button'
import ExpandArrow from '../../assets/expand_arrow'
import { colors } from '../../utils/colors'

interface RelatedProps {
}

const RelatedQueries: React.FC<RelatedProps> = () => {

  return (
    <div className='h-full flex flex-col items-center justify-center p-4 lg:p-8 text-center'>
      <div className='space-y-6 lg:space-y-8'>
        <Text className='text-background text-sm lg:text-[16px]' type='bold-body'>
          Experience the <br className='hidden lg:block' /> Live Edge Agent
        </Text>
        <div className='flex justify-center w-full px-2'>
          <Button
            onClick={() => window.location.href = 'http://localhost:3000/'}
            className='justify-center px-4 lg:px-10 py-3 w-full lg:w-auto'
            custom_type='primary'
            rounded
          >
            Go to Live Agent
          </Button>
        </div>
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