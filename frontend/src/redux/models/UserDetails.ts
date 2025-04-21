import { createModel } from '@rematch/core';
import { RootModel } from './models'; // Adjust the import based on your project structure

export interface UserState {
  created_on: string;
  email: string;
  id: number;
  is_active: boolean;
  is_admin: boolean;
  last_modified_on: string;
  name: string;
  // Add other user properties as needed
}

const userDetails = createModel<RootModel>()({
  state: null as UserState | null,
  reducers: {
    setUser(state, payload: UserState) {      
      return payload;
    },
    clearUser() {
      return null;
    },
  },
});

export default userDetails;
