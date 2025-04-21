export interface MemberRoleState{
    service: string;
    details: any;
}

const initialState: MemberRoleState = {
    service: '',
    details: {}
  };


const memberRole = {
    state: initialState,
    reducers: {
        setRole(state: MemberRoleState, payload: MemberRoleState): MemberRoleState {
            return { ...state, details: payload?.details, service: payload?.service}
        }
    }
}

export default memberRole;