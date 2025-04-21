// models.ts
import { Models } from '@rematch/core';
import chatContent from './ChatContents';
import userDetails from './UserDetails';
import modal from './OpenModal';
import toast from './ToastMessage';
import memberRole from './MemberRole';
import loadingState from './loadingState';

export interface RootModel extends Models<RootModel> {
  chatContent: typeof chatContent;
  modal: typeof modal;
  userDetails: typeof userDetails;
  toast: typeof toast;
  memberRole: typeof memberRole
  loadingState: typeof loadingState
}

const models: RootModel = {
  chatContent,
  modal,
  userDetails,
  toast,
  memberRole,
  loadingState
};

export default models;
