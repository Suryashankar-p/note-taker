interface LoadingState {
    status: boolean;
}

const iniatialState: LoadingState = {
    status: false
}

const loadingState = {
    state: iniatialState,
    reducers: {
        startLoading(state: LoadingState) {
            return { ...state, status: true }
        },
        endLoading(state: LoadingState) {
            return { ...state, status: false }
        }

    }
}
export default loadingState