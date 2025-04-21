import { init, Models, RematchDispatch, RematchRootState } from '@rematch/core';
import modal, { ModalState } from './models/OpenModal';
import chatContent, { ChatContentState } from './models/ChatContents'
import userDetails, { UserState } from './models/UserDetails'
import { RootModel } from './models/models';
import toast from './models/ToastMessage';
import memberRole from './models/MemberRole';
import loadingState from './models/loadingState';

export interface RootModels extends Models<RootModel> {
  modal: typeof modal;
  chatContent: typeof chatContent;
  userDetails: typeof userDetails;
  toast: typeof toast;
  memberRole: typeof memberRole
  loadingState: typeof loadingState
}

const models: any = {
  modal,
  chatContent,
  userDetails,
  toast,
  memberRole,
  loadingState
};


const store = init({
  models, // Add the localStorageMiddleware here
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export default store;
