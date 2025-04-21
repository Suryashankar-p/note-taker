// models/modal.ts
import { Models } from '@rematch/core';

type ModalType = {
  status: boolean;
  type?: string;
}


export interface ModalState {
  isOpen: ModalType;
  qandaOpen: ModalType;
  confirmation: boolean;
  addProduct: ModalType;
  addMember: ModalType;
  dislikeReason: ModalType;
  editLimit: boolean;
  feedbackReview: ModalType;
  tranferModal: boolean;
}

const initialValue: ModalType = {
  status: false,
  type: ''
}

const modal = {
  state: {
    isOpen: initialValue,
    qandaOpen: initialValue,
    confirmation: false,
    addProduct: initialValue,
    addMember: initialValue,
    dislikeReason: initialValue,
    editLimit: false,
    feedbackReview: initialValue,
    tranferModal: false,
  } as ModalState,
  reducers: {
    openModal(state: ModalState, payload: string) {
      return { ...state, isOpen: { status: true, type: payload } };
    },
    closeModal(state: ModalState) {
      return { ...state, isOpen: { status: false, type: state.isOpen.type } };
    },
    openQandA(state: ModalState, payload: string) {
      return { ...state, qandaOpen: { status: true, type: payload } }
    },
    closeQandA(state: ModalState) {
      return { ...state, qandaOpen: { status: false, type: state.qandaOpen.type } };
    },
    openConfirmation(state: ModalState) {
      return { ...state, confirmation: true }
    },
    closeConfirmation(state: ModalState) {
      return { ...state, confirmation: false }
    },
    openAddProduct(state: ModalState, payload: string) {
      return { ...state, addProduct: { status: true, type: payload } }
    },
    closeAddProduct(state: ModalState) {
      return { ...state, addProduct: { status: false, type: state.addProduct.type } }
    },
    openAddMember(state: ModalState, payload: string) {
      return { ...state, addMember: { status: true, type: payload } }
    },
    closeAddMember(state: ModalState) {
      return { ...state, addMember: { status: false, type: state.addMember.type } }
    },
    openDislikeReason(state: ModalState, payload: string) {
      return { ...state, dislikeReason: { status: true, type: payload } }
    },
    CloseDislikeReason(state: ModalState) {
      return { ...state, dislikeReason: { status: false, type: state.dislikeReason.type } }
    },
    openEditLimit(state: ModalState) {
      return { ...state, editLimit: true }
    },
    closeEditLimit(state: ModalState) {
      return { ...state, editLimit: false }
    },
    openFeedbackReview(state: ModalState, payload: string) {
      return { ...state, feedbackReview: { status: true, type: payload } }
    },
    closeFeedbackReview(state: ModalState) {
      return { ...state, feedbackReview: { status: false, type: state.feedbackReview.type } }
    },
    openTranferModal(state: ModalState) {
      return { ...state, tranferModal: true }
    },
    closeTranferModal(state: ModalState) {
      return { ...state, tranferModal: false }
    }
  }
}

export default modal;
