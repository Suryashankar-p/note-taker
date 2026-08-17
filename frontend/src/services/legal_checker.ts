import { axiosLegalChecker } from "./axiosInstances";

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

// Fetched through the authenticated axios instance (blob), rather than a raw
// <a href> URL, since a plain browser navigation wouldn't carry the login
// token the backend now requires.
export const GetNDAResultFile = async (activityId: number) => {
  const response = await axiosLegalChecker.get(`/lcc/nda/${activityId}/download`, {
    responseType: "blob",
  });
  return response.data;
};

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

export const GetBGResultFile = async (activityId: number) => {
  const response = await axiosLegalChecker.get(`/lcc/bg/${activityId}/download`, {
    responseType: "blob",
  });
  return response.data;
};

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

export const GetNDAAdminStatus = async () => {
  const response = await axiosLegalChecker.get("/lcc/admin/nda/status");
  return response.data;
};

//<====================================Members========================================>

export const GetLegalCheckerRole = async () => {
  const response = await axiosLegalChecker.get("/lcc/member/me");
  return response.data;
};

export const ReadMembers = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await axiosLegalChecker.get(
    `/lcc/member?skip=${skip}&limit=${limit}${
      search_term ? "&search_term=" + search_term : ""
    }`
  );
  return response.data;
};

export const CreateMember = async (role: string, email: string, name: string) => {
  const response = await axiosLegalChecker.post(
    `/lcc/member?role=${role}&email=${email}&name=${name}`
  );
  return response.data;
};

export const UpdateMember = async (role: string, member_id: string) => {
  const response = await axiosLegalChecker.patch(`/lcc/member/${member_id}?role=${role}`);
  return response.data;
};

export const DeleteMember = async (member_id: string) => {
  const response = await axiosLegalChecker.delete(`/lcc/member/${member_id}`);
  return response.data;
};
