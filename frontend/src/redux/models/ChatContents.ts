// models/chatContent.ts
import { Models } from "@rematch/core";

export interface ChatContentState {
  chatContent: any[];
}

const chatContent = {
  state: {
    chatContent: [],
  } as ChatContentState,

  reducers: {
    addQuestion(state: ChatContentState, payload: any) {
      return { ...state, chatContent: [...state.chatContent, ...payload] };
    },
    removeQuestionById(state: ChatContentState, tempId: number) {
      return {
        ...state,
        chatContent: state.chatContent.filter(
          (message) => message.id !== tempId
        ),
      };
    },
    replaceChatHistoryWithLocal(
      state: ChatContentState,
      payload: { apiHistory: any[]; localMessages: any[] }
    ) {
      // apiHistory contains the latest message from the backend
      return {
        ...state,
        chatContent: [...payload.apiHistory, ...payload.localMessages],
      };
    },
    clearChat(state: ChatContentState) {
      return { chatContent: [] };
    },
    addChat(state: ChatContentState, payload: any) {
      return {
        ...state,
        chatContent: [...payload.reverse(), ...state.chatContent],
      };
    },
    removeQuestion(state: ChatContentState) {
      const newChatContent = state.chatContent.slice(0, -1);
      return { ...state, chatContent: newChatContent };
    },
  },
};

export default chatContent;
