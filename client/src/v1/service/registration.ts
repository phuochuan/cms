import {toast} from "sonner";
import instance from "../utils/customizeAxios.ts";
import {isStatusSuccesful} from "../utils/checkResStatus.ts";

import type {UploadFile} from "antd";
import {RegistrationParamsType} from "../redux/slice/admin-registration.slice.ts";
import OrderByMapping from "../utils/orderByMapping.ts";
import {Status} from "../constant";

export async function fetchAllRegistrations(
    params: RegistrationParamsType,
    page: number = 1,
    pageSize: number = 8
) {
    const status: string =
        params.status == "Declined (Document)"
            ? "DOCUMENT_DECLINED"
            : params.status == "Verifying"
                ? "VERIFYING_ACCOUNTANT" : params.status.toUpperCase();


    const orderBy: string = OrderByMapping(params.orderBy);

    const search: string = params.search.toLowerCase();
    const isAscending: string = params.isAscending ? "true" : "false";

    const url = `/registrations?status=${status}&search=${search}&orderBy=${orderBy}&isAscending=${isAscending}&page=${page}&pageSize=${pageSize}`;

    try {
        const response = await instance.get(url);
        return response.data;
    } catch (error) {
        throw new Error("Error while fetching registrations");
    }
}

export const approveRegistration = async (id: number, close: VoidFunction) => {
    const res = await instance.post(`/registrations/${id}/approve`);
    if (isStatusSuccesful(res.status)) {
        toast.success("Registration approved", {
            style: { color: "green" },
            description: "Registration approved successfully",
        });
        close();
        return res.status;
    }

    toast.error("Failed to approve registration", {
        style: { color: "red" },
        description: res.data.message,
    });
};

export const declineRegistration = async (
    id: number,
    comment: string,
    close: VoidFunction
) => {
    const res = await instance.post(`/registrations/${id}/decline`, {
        comment,
    });
    if (isStatusSuccesful(res.status)) {
        toast.success("Registration declined", {
            style: { color: "green" },
            description: "Registration declined successfully",
        });
        close();
        return res.status;
    }

    toast.error("Failed to decline registration", {
        style: { color: "red" },
        description: "Failed to decline registration",
    });
};
export const startLearning = async (id: number) => {
    const res = await instance.post(`/registrations/start-learning/${id}`);
    if (isStatusSuccesful(res.status)) {
        toast.success("Start learning", {
            style: { color: "green" },
            description: "Start learning successfully",
        });
        return res.status;
    }

    toast.error("Failed to start learning", {
        style: { color: "red" },
        description: "Failed to start learning",
    });
};

export const closeRegistration = async (
    id: number,
    comment: string,
    close: VoidFunction
) => {
    const res = await instance.post(`/registrations/${id}/close`, {
        comment,
    });
    if (isStatusSuccesful(res.status)) {
        toast.success("Registration closed", {
            style: { color: "green" },
            description: "Registration closed successfully",
        });
        close();
        return res.status;
    }

    toast.error("Failed to close registration", {
        style: { color: "red" },
        description: "Failed to close registration",
    });
};

export const removeRegistration = async (id: number) => {
    const res = await instance.delete(`/registrations/${id}`);
    if (isStatusSuccesful(res.status)) {
        toast.success("Registration removed", {
            style: { color: "green" },
            description: "Registration removed successfully!!!",
        });
        return res.status;
    }

    toast.error("Failed to remove registration", {
        style: { color: "red" },
        description: "Something went wrong, please try again!!!",
    });
};

export const submitDocument = async (
    listFileCertificate: UploadFile[],
    listFilePayment: UploadFile[],
    id: string | undefined
) => {
    try {
        const formData = new FormData();
        if (listFilePayment.length > 0) {
            // Append payment files
            listFilePayment.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("payment", file.originFileObj);
                }
            });
        } else formData.append("payment", "");

        if (listFileCertificate.length > 0) {
            // Append certificate files
            listFileCertificate.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("certificate", file.originFileObj);
                }
            });
        } else formData.append("certificate", "");

        const response = await instance.post(
            `/documents/registrations/${id}`,
            formData
        );

        return response;
    } catch (error) {
        toast.error("Document Submission Failed", {
            style: { color: "red" },
            description:
                "There was an error submitting your documents. Please try again later.",
        });
    }
};

export const finishLearning = async (id: string | number) => {
    const response = await instance.put(`/registrations/${id}/finish-learning`);
    response.status == 200
        ? toast.success("Finish learning", {
            style: { color: "green" },
            description:
                "Congratulations! You have successfully completed the course.",
        })
        : toast.error("Failed to finish learning", {
            style: { color: "red" },
            description:
                "Opps.., some thing went wrong. Please, reload the page and try again",
        });
    return response;
};

export const discardRegistration = async (id: number) => {
    const res = await instance.post(`/registrations/${id}/discard`);
    if (isStatusSuccesful(res.status)) {
        toast.success("Registration discarded", {
            style: { color: "green" },
            description: "Registration discarded successfully",
        });
        return res.status;
    }

    toast.error("Failed to discard registration", {
        style: { color: "red" },
        description: "Failed to discard registration",
    });
};

export const submitWithExistedCourse = async ({
                                                  courseId,
                                                  duration,
                                                  durationUnit,
                                              }: {
    courseId: string;
    duration: number;
    durationUnit: string;
}) => {
    const params = {
        duration,
        durationUnit,
    };
    const response = await instance.post(
        `/registrations/${courseId}/enroll`,
        params
    );
    return response;
};

type DocumentType = {
    id: number;
    registrationId: number;
    url: string;
    status: string;
    type: string;
};

type DataFormType = {
    feedbackRequest?: string;
    [key: number]: string;
};

export const approve_Decline_Document_Registration = async (
    id: number | undefined,
    feedback: string | undefined,
    data: DocumentType[],
    type: string
) => {
    try {
        const dataForm: DataFormType = {};

        if (feedback && feedback !== "") {
            dataForm.feedbackRequest = feedback;
        }

        data.forEach((item) => {
            dataForm[item.id] = item.status;
        });

        const response = await instance.post(
            `/registrations/${id}/verify?status=${type}`,
            dataForm
        );
        return response;
    } catch (error) {
        toast.error("Error while approving documents", {
            style: {
                color: "green",
            },
            description: "Ooppps.... Something went wrong. Please try again",
        });
    }
};

export const resubmitDocument = async (
    id: number | undefined,
    listFileCertificate: UploadFile[],
    listFilePayment: UploadFile[],
    listIdRemove: number[]
) => {
    try {
        const formData = new FormData();

        // Append payment files
        listFilePayment.forEach((file) => {
            if (file.originFileObj) {
                formData.append("payment", file.originFileObj);
            }
        });

        // Append certificate files
        listFileCertificate.forEach((file) => {
            if (file.originFileObj) {
                formData.append("certificate", file.originFileObj);
            }
        });

        if (listIdRemove.length > 0) {
            listIdRemove.forEach((id) => {
                formData.append("deleted_documents", id.toString());
            });
        } else {
            formData.append("deleted_documents", "");
        }

        const response = await instance.post(
            `/documents/registrations/${id}/resubmit-document`,
            formData
        );
        return response;
    } catch (error) {
        toast.error("Error while re-submitting documents", {
            style: {
                color: "red",
            },
            description: "Ooppps.... Something went wrong. Please try again",
        });
    }
};

export async function fetchListOfMyRegistration(
    page: number = 1,
    status: string = "Submited"
) {
    try {
        const response = await instance.get(
            `/registrations/my-registration?page=${page}&status=${status}`
        );
        return response;
    } catch (error) {
        toast.error("_", {
            style: { color: "red" },
        });
    }
}

export async function createNewRegistration(
    data: FormData,
    close: VoidFunction,
    setFlag: VoidFunction
) {
    try {
        const res = await instance.postForm("/registrations", data);
        if (isStatusSuccesful(res.status)) {
            toast.success("Create a new registration successfully", {
                description: "",
                style: {
                    color: "green",
                    fontWeight: "bold",
                },
            });
            setFlag();
            close();
            return;
        }
    } catch (err) {
        toast.error("Create a new registration unsuccessfully", {
            description:
                "Your course request already exists in the system. Please check again!",
            style: {
                color: "red",
                fontWeight: "bold",
            },
        });
    }
}

export async function editRegistration(
    id: number,
    data: FormData,
    status: Status,
    close: VoidFunction,
    setFlag: VoidFunction
) {
    try {
        const res = await instance.put(`/registrations/${id}/edit`, data);
        if (status === Status.DRAFT && res.status === 201) {
            setFlag();
            close();
            toast.success("Submit registration successfully", {
                description: "",
                style: {
                    color: "green",
                    fontWeight: "bold",
                    textAlign: "center",
                },
            });
        } else {
            setFlag();
            close();
            toast.success("Re-submit registration successfully", {
                description: "",
                style: {
                    color: "green",
                    fontWeight: "bold",
                    textAlign: "center",
                },
            });
        }
    } catch (error: any) {
        if (error.response) return error.response.status;
        else return 503;
    }
}

export async function saveRegistrationAsDraft(
    data: FormData,
    id: number,
    closeModal: VoidFunction
) {
    const res = id
        ? await instance.put(`/registrations/${id}/draft`, data)
        : await instance.postForm("/registrations/draft", data);
    if (isStatusSuccesful(res.status)) {
        toast.success("Registration saved as draft", {
            style: { color: "green" },
            description: "Registration saved as draft successfully",
        });
        closeModal();
        return res.status;
    }
    if (res.status === 409) {
        toast.error("Save registration as draft unsuccessfully", {
            style: { color: "red" },
            description: "Course4U already has this course!!",
        });
        return res.status;
    }
    toast.error("Save registration as draft unsuccessfully", {
        style: { color: "red" },
        description: "Please provide the course link to save it as a draft!!",
    });
}

export async function saveDraftWithCourse(
    data: FormData,
    courseId: number,
    closeModal: VoidFunction
) {
    const res = await instance.post(`/registrations/${courseId}/draft-enroll`, {
        duration: data.get("duration"),
        durationUnit: data.get("durationUnit"),
    });
    if (isStatusSuccesful(res.status)) {
        toast.success("Registration saved as draft", {
            style: { color: "green" },
            description: "Registration saved as draft successfully",
        });
        closeModal();
        return res.status;
    }
    toast.error("Save registration as draft unsuccessfully", {
        style: { color: "red" },
        description: "Oops! Something went wrong, please try again",
    });
}
