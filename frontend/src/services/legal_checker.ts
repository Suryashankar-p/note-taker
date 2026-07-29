import { axiosLegalChecker } from "./axiosInstances";

const BACKEND_LEGAL_CHECKER_URL =
  import.meta.env.VITE_BACKEND_LEGAL_CHECKER_URL ||
  window.env?.BACKEND_LEGAL_CHECKER_URL;

//<====================================NDA Review========================================>

export const CreateNDAActivity = async (
  title: string,
  documentType: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("document_type", documentType);
  formData.append("file", file, file.name);

  const response = await axiosLegalChecker.post("/lcc/nda/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const ListNDAActivities = async () => {
  const response = await axiosLegalChecker.get("/lcc/nda/");
  return response.data;
};

export const GetNDAActivity = async (activityId: number) => {
  const response = await axiosLegalChecker.get(`/lcc/nda/${activityId}`);
  return response.data;
};

export const GetNDAStatus = async (activityId: number) => {
  const response = await axiosLegalChecker.get(`/lcc/nda/${activityId}/status`);
  return response.data;
};

export const getNDADownloadUrl = (activityId: number) =>
  `${BACKEND_LEGAL_CHECKER_URL}/lcc/nda/${activityId}/download`;

//<====================================Bank Guarantee Review========================================>

export const CreateBGActivity = async (
  title: string,
  bgType: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("bg_type", bgType);
  formData.append("bg_file", file, file.name);

  const response = await axiosLegalChecker.post("/lcc/bg/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const ListBGActivities = async () => {
  const response = await axiosLegalChecker.get("/lcc/bg/");
  return response.data;
};

export const GetBGActivity = async (activityId: number) => {
  const response = await axiosLegalChecker.get(`/lcc/bg/${activityId}`);
  return response.data;
};

export const GetBGStatus = async (activityId: number) => {
  const response = await axiosLegalChecker.get(`/lcc/bg/${activityId}/status`);
  return response.data;
};

export const getBGDownloadUrl = (activityId: number) =>
  `${BACKEND_LEGAL_CHECKER_URL}/lcc/bg/${activityId}/download`;

//<====================================Admin — NDA Templates & Deviation Matrix========================================>

export const UploadNDATemplate = async (
  type: "unilateral" | "mutual",
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await axiosLegalChecker.post(
    `/lcc/admin/nda/template/${type}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const UploadNDADeviationMatrix = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await axiosLegalChecker.post(
    "/lcc/admin/nda/deviation-matrix",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};
