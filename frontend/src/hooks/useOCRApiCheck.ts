// useApiCheck.ts
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetMemberOCRRole } from '../services/tbwes_ocr.ts';
import store, { Dispatch } from '../redux/store.ts';

// Define the shape of the API response
interface ApiResponse {
  role?: string;
}

const useOCRApiCheck = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: ApiResponse = await GetMemberOCRRole();
        if (!data?.role) {
          navigate('/ai-studio', { state: { message: 'User not a member' } });
        } else {
          (store.dispatch as Dispatch).memberRole.setRole({ service: 'ocr', details: data })
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching member sales role:', error);
      }
    };

    fetchData();
  }, [navigate]);

  return loading;
};

export default useOCRApiCheck;
