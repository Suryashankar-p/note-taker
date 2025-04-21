// import store, { Dispatch } from "../redux/store";
// import { fileTypeSelctor } from "../utils/functions";
// import { deleteAPI, getAPI, patchAPI, postAPI, putAPI } from "./Axios";
// import axios from "axios";


// // const BASE_URL = 'http://localhost/api'
// const DOMAIN = import.meta.env.VITE_DOMAIN
// const URL_PREFIX = import.meta.env.VITE_URL_PREFIX
// const BASE_URL = `${DOMAIN === 'localhost' ? "http:" : "https:"}//${DOMAIN}${URL_PREFIX}`

// ////===============================================\\\\\\\\\\\\
// //Training QA APIs

// export const GetTrainingQARole = async () => {
//     const response = await getAPI(BASE_URL + '/training_qa/member/me')
//     return response
//   }
  
  
//   export const ChatTrainingQA = async (question: string) => {
//     const response = await postAPI(BASE_URL + `/training_qa/chat?question=${question}`)
//     return response
//   }