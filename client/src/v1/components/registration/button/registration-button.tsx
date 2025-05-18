import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { UploadFile } from "antd";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { isExistAvailableCourseWithId } from "../../../service/course.ts";
import {
    discardRegistration,
    fetchListOfMyRegistration,
    finishLearning,
    removeRegistration,
    resubmitDocument,
    saveDraftWithCourse,
    saveRegistrationAsDraft,
    startLearning,
    submitDocument,
    submitWithExistedCourse,
} from "../../../service/registration.ts";

import { Button } from "../../ui/button.tsx";
import ModalConfirm from "../../modal/modal-confirm.tsx";

import { RootState } from "../../../redux/store/store.ts";
import { useRegistrationDetail } from "../../../hooks/use-registration-detail.ts";
import { useRegistrationModal } from "../../../hooks/use-registration-modal.ts";
import { saveDataListRegistration } from "../../../redux/slice/registration.slice.ts";
import { useRefreshState } from "../../../hooks/use-refresh-state.ts";
import { isStatusSuccesful } from "../../../utils/checkResStatus.ts";
import { registrationSchema } from "../../../schemas/registration-schema.ts";
import { convertToFormData } from "../../../utils/convertToFormData.ts";
import { durationSchema } from "../../../schemas/registration-schema.ts";
import SendReviewModal from "../../modal/send-review-modal.tsx";
import { checkExistReview, sendReview } from "../../../service/course-review.ts";
import { Status } from "../../../constant";

type Props = {
    status?: Status;
    setIsEdit: (isEdit: boolean) => void;
    isEdit: boolean;
    id?: number;
    isStatrted?: boolean;
    listFileCertificate?: UploadFile[];
    listFilePayment?: UploadFile[];
    duration?: number;
    durationUnit?: string;
    listIdDocumentRemove?: number[];
    blockEditCourseForm?: boolean;
    setBlockEditCourseForm: React.Dispatch<React.SetStateAction<boolean>>;
    form: UseFormReturn<z.infer<typeof registrationSchema>> | undefined;
};

export const RegistrationButton = ({
    status = Status.NONE,
    setIsEdit,
    isEdit,
    id,
    listFileCertificate,
    listFilePayment,
    isStatrted,
    blockEditCourseForm = false,
    setBlockEditCourseForm,
    duration,
    durationUnit,
    listIdDocumentRemove,
    form,
}: Props) => {
    const { registration, closeRegistration } = useRegistrationDetail();
    const { close } = useRegistrationModal((state) => state);
    const [isLoading, setIsLoading] = useState(false);
    const { setRegistrationFlagAdmin } = useRefreshState((state) => state);
    const [haveReview, setHaveReview] = useState<boolean>(true);

    //state to manange review and send rating
    const [rating, setRating] = useState<number>(0);
    const [reviewContent, setReviewContent] = useState<string>("");

    const closeModal = () => {
        close();
        closeRegistration();
        setRegistrationFlagAdmin();
    };

    const onEdit = async () => {
        setIsEdit(true);
        const response = await isExistAvailableCourseWithId(registration!.id!);
        if (
            response.data &&
            (registration?.status === Status.SUBMITTED ||
                registration?.status === Status.DECLINED)
        )
            setBlockEditCourseForm(true);
    };

    //Delete a registration
    const handleDeleteButtonClick = async () => {
        setIsLoading(true);
        const res = await removeRegistration(id!);
        if (res !== 200) {
            setIsLoading(false);
            return;
        }
        closeModal();
        setIsLoading(false);
    };

    const handleStartLearning = async () => {
        if (registration?.startDate) {
            window.open(registration?.course?.link);
            return;
        }
        setIsLoading(true);
        const res = await startLearning(id!);
        if (res !== 200) {
            setIsLoading(false);
            return;
        }
        window.open(registration?.course?.link);
        closeModal();
        setIsLoading(false);
    };

    const handleFinishLearning = async () => {
        setIsLoading(true);
        await finishLearning(id!);
        closeModal();
        setIsLoading(false);
    };

    const handleDiscard = async () => {
        setIsLoading(true);
        const res = await discardRegistration(id!);
        if (res !== 200) {
            setIsLoading(false);
            return;
        }
        closeModal();
        setIsLoading(false);
    };

    const handleSubmitWithExistedCourse = async () => {
        const registrationData = {
            courseId: registration!.course!.id!,
            duration: duration!,
            durationUnit: durationUnit!,
        };
        // Validate registration data using registrationSchema
        const validationResult = durationSchema.safeParse(duration);

        if (!validationResult.success) {
            // Handle validation errors
            toast.error("Check your duration", {
                style: { color: "red" },
                description:
                    "Please check the duration. It must be a positive integer greater than 0.",
            });
            return;
        }

        try {
            const res = await submitWithExistedCourse(registrationData);
            if (isStatusSuccesful(res.status)) {
                toast.success("Create a registration successfully", {
                    style: { color: "green" },
                    description: "The registration was created successfully.",
                });
                closeModal();
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error("An error occurred", {
                style: { color: "red" },
                description: "Failed to create the registration.",
            });
        }
    };

    const handleSendReview = async () => {
        const response = await sendReview(
            rating,
            reviewContent,
            registration!.course!.id!
        );
        if (isStatusSuccesful(response.status)) {
            toast.success("Review sent successfully", {
                style: { color: "green" },
                description: "Your review has been sent successfully.",
            });
            setHaveReview(true);
        } else {
            toast.error("Failed to send review", {
                style: { color: "red" },
                description: "Failed to send review" + response.statusText,
            });
        }
    };

    //Submit Document
    const currentPage = useSelector(
        (state: RootState) => state.registration.currentPage
    );
    const filterBy = useSelector(
        (state: RootState) => state.registration.status
    );
    const dispatch = useDispatch();
    const handleSubmitDocument = async () => {
        if (
            listFileCertificate?.length === 0 ||
            listFilePayment?.length === 0
        ) {
            return toast.error("Document Submission Failed", {
                style: { color: "red" },
                description:
                    "Both certificates and payments are required. Please ensure all necessary documents are submitted.",
            });
        }
        const response = await submitDocument(
            listFileCertificate!,
            listFilePayment!,
            id?.toString()
        );
        if (response && response.status === 200) {
            toast.success("Document Submitted Successfully", {
                style: { color: "green" },
                description:
                    "Your registration has been completed successfully.",
            });
            const result = await fetchListOfMyRegistration(
                currentPage,
                filterBy
            );
            if (result && result.data) {
                dispatch(saveDataListRegistration(result.data));
            }
            closeModal();
        } else {
            toast.error("Document Submission Failed", {
                style: { color: "red" },
                description: response?.data.message
                    ? response.data.message
                    : "There was an error submitting your documents. Please try again later.",
            });
        }
    };

    //User Re-submit Document
    const handleReSubmitDocument = async () => {
        const response = await resubmitDocument(
            id!,
            listFileCertificate!,
            listFilePayment!,
            listIdDocumentRemove!
        );
        if (response && response.status === 200) {
            toast.success("Document Re-submitted Successfully", {
                style: { color: "green" },
                description:
                    "The document has been re-submitted and will be reviewed shortly.",
            });
            const result = await fetchListOfMyRegistration(
                currentPage,
                filterBy
            );
            if (result && result.data) {
                dispatch(saveDataListRegistration(result.data));
            }
            closeModal();
        } else {
            toast.error("Document Re-submitted Failed", {
                style: { color: "red" },
                description: response?.data.message
                    ? response.data.message
                    : "There was an error submitting your documents. Please try again later.",
            });
        }
    };
    const handleCheckExistReview = async () => {
        if (
            status === Status.DONE ||
            status === Status.VERIFIED ||
            status === Status.VERIFYING ||
            status === Status.CLOSED ||
            status === Status.DOCUMENT_DECLINED
        ) {
            const response = await checkExistReview(registration!.course!.id!);
            if (isStatusSuccesful(response.status)) {
                setHaveReview(response.data);
            }
        }
    };

    const handleSaveAsDraft = async () => {
        setIsLoading(true);
        const data = await convertToFormData(form?.getValues());
        if (!data) return;
        blockEditCourseForm &&
        registration?.course?.id &&
        status === Status.NONE
            ? await saveDraftWithCourse(
                  data,
                  +registration?.course?.id,
                  closeModal
              )
            : await saveRegistrationAsDraft(data, id!, closeModal);
        setIsLoading(false);
    };

    useEffect(() => {
        handleCheckExistReview();
    }, [status]);
    return (
        <div className='flex justify-end gap-4'>
            {(status === Status.NONE || status === Status.DRAFT) && (
                <ModalConfirm
                    handleConfirm={handleSaveAsDraft}
                    title='Save registration as draft'
                    description='Do you want to save this registration as draft ?'
                    isLoading={isLoading}
                >
                    <Button size='default' variant='gray' type='button'>
                        SAVE AS DRAFT
                    </Button>
                </ModalConfirm>
            )}
            {(status === Status.DRAFT || status === Status.DISCARDED) && (
                <ModalConfirm
                    title='Delete this registration?'
                    description='Are you sure you want to delete this form? This action cannot be undone.'
                    cancelButtonTitle='Cancel'
                    acceptButtonTitle='Yes, Delete'
                    handleConfirm={handleDeleteButtonClick}
                    isLoading={isLoading}
                >
                    <Button
                        type='button'
                        size='default'
                        variant='danger'
                        disabled={isLoading}
                    >
                        DELETE
                    </Button>
                </ModalConfirm>
            )}
            {(status === Status.SUBMITTED ||
                status === Status.DECLINED ||
                status === Status.APPROVED) &&
                !isEdit && (
                    <Button
                        size='default'
                        variant='gray'
                        type='button'
                        onClick={handleDiscard}
                        disabled={isLoading}
                    >
                        DISCARD
                    </Button>
                )}
            {status === Status.APPROVED && !registration?.startDate && (
                <ModalConfirm
                    handleConfirm={handleStartLearning}
                    title='Do you want to start learning this course?'
                    description='Start learning cannot undo !!! Are you sure you want to start learning this course?'
                    isLoading={isLoading}
                >
                    <Button
                        size='default'
                        variant='blue'
                        type='button'
                        disabled={isLoading}
                    >
                        START LEARNING
                    </Button>
                </ModalConfirm>
            )}

            {status === Status.APPROVED && registration?.startDate && (
                <Button
                    size='default'
                    variant='blue'
                    type='button'
                    onClick={handleStartLearning}
                    disabled={isLoading}
                >
                    START LEARNING
                </Button>
            )}

            {status === Status.APPROVED && (
                <ModalConfirm
                    handleConfirm={handleFinishLearning}
                    title='Do you want to finish this course?'
                    description='Are you sure you have completed the course and want to confirm completion?'
                    isLoading={isLoading}
                >
                    <Button
                        className={
                            "" +
                            (!isStatrted &&
                                "select-none pointer-events-none opacity-30")
                        }
                        size='default'
                        variant='success'
                        disabled={isLoading}
                    >
                        DONE
                    </Button>
                </ModalConfirm>
            )}

            {(status === Status.SUBMITTED || status === Status.DECLINED) &&
                isEdit === false && (
                    <Button
                        size='default'
                        variant='blue'
                        type='button'
                        onClick={onEdit}
                    >
                        EDIT
                    </Button>
                )}

            {status === Status.NONE && blockEditCourseForm && (
                <Button
                    type='button'
                    onClick={handleSubmitWithExistedCourse}
                    size='default'
                    variant='success'
                >
                    SUBMIT
                </Button>
            )}
            {((status === Status.NONE && !blockEditCourseForm) ||
                status === Status.DRAFT) && (
                <Button variant='success' size='default'>
                    SUBMIT
                </Button>
            )}
            {(status === Status.SUBMITTED || status === Status.DECLINED) &&
                isEdit && (
                    <Button type='submit' size='default' variant='success'>
                        RE-SUBMIT
                    </Button>
                )}

            {!haveReview &&
                (status === Status.DONE ||
                    status === Status.VERIFIED ||
                    status === Status.VERIFYING ||
                    status === Status.DOCUMENT_DECLINED ||
                    status === Status.CLOSED) && (
                    <SendReviewModal
                        title='Give your review'
                        rating={rating}
                        setRating={setRating}
                        reviewContent={reviewContent}
                        setReviewContent={setReviewContent}
                        handleConfirm={handleSendReview}
                    >
                        <Button
                            type='button'
                            size='default'
                            variant='primary'
                            disabled={isLoading}
                        >
                            REVIEW
                        </Button>
                    </SendReviewModal>
                )}
            {status === Status.DONE && (
                <Button
                    size='default'
                    variant='blue'
                    disabled={isLoading}
                    type='button'
                    onClick={handleSubmitDocument}
                >
                    ASSIGN TO REVIEW
                </Button>
            )}
            {status === Status.DOCUMENT_DECLINED && (
                <>
                    <ModalConfirm
                        title='Re-submit document'
                        description='Are you sure you want to re-submit document?'
                        cancelButtonTitle='No'
                        acceptButtonTitle='Yes'
                        handleConfirm={handleReSubmitDocument}
                        isLoading={isLoading}
                    >
                        <Button
                            size='lg'
                            variant='success'
                            disabled={isLoading}
                            type='button'
                        >
                            RE-SUBMIT
                        </Button>
                    </ModalConfirm>
                    {/* <Modal
                        title={
                            <p style={{ fontSize: "1.2rem" }}>
                                Re-submit document
                            </p>
                        }
                        open={openModalConfirmResubmit}
                        onOk={handleReSubmitDocument}
                        onCancel={() => setOpenModalConfirmResubmit(false)}
                        okText='Yes'
                        cancelText='No'
                        centered={true}
                        confirmLoading={confirmLoadingResubmit}
                        okButtonProps={{
                            style: {
                                backgroundColor: "#861fa2",
                                color: "white",
                                width: "80px",
                            },
                        }}
                        cancelButtonProps={{
                            style: {
                                borderColor: "#ccc",
                                color: "black",
                                width: "80px",
                            },
                        }}
                    >
                        <p
                            style={{
                                fontSize: "1rem",
                                margin: "10px 0px 40px 0px",
                            }}
                        >
                            Are you sure you want to re-submit document?
                        </p>
                    </Modal> */}
                </>
            )}
        </div>
    );
};
