import {useRegistrationModal} from "../../../hooks/use-registration-modal.ts";
import {Status} from "../../../constant";

import {useRefreshState} from "../../../hooks/use-refresh-state.ts";
import {Button} from "../../ui/button.tsx";
import {useState} from "react";
import {
    approveRegistration,
    closeRegistration,
} from "../../../service/registration.ts";
import instance from "../../../utils/customizeAxios.ts";
import {toast} from "sonner";

type Props = {
    status?: Status;
    haveFeedback?: boolean;
};
export const RegistrationButtonAdmin = ({
                                            status = Status.NONE,
                                            haveFeedback = false,
                                        }: Props) => {
    const { close, id } = useRegistrationModal((store) => store);
    const { setRegistrationFlagAdmin } = useRefreshState((state) => state);
    const [isLoading, setIsLoading] = useState(false);
    const closeModal = () => {
        close();
        setRegistrationFlagAdmin();
    };
    // Add the handleApprove function
    const handleApprove = async () => {
        setIsLoading(true);
        await approveRegistration(id!, close);

        closeModal();
        setIsLoading(false);
    };

    const handleClose = async () => {
        setIsLoading(true);
        await closeRegistration(id!, "", close);

        closeModal();
        setIsLoading(false);
    };

    async function handleVerfified() {
        const res = await instance.put(`/v2/registration/${id}/admin`, {});

        window.location.reload();

        toast.success("Create a new course successfully", {
            description: "",
            style: {
                color: "green",
                fontWeight: "bold",
                textAlign: "center",
            },
        });
    }

    return (
        <div className='flex justify-end gap-4 select-none'>
            {status === Status.SUBMITTED && (
                <Button variant='danger'>Decline and send feedback</Button>
            )}
            {status === Status.SUBMITTED &&
                (
                    <Button
                        variant='success'
                        type='button'
                        onClick={handleApprove}
                        disabled={isLoading || haveFeedback}
                        className={
                            haveFeedback ? "cursor-not-allowed select-none" : ""
                        }
                        title={
                            haveFeedback
                                ? "You can't approve when feedback is not empty"
                                : ""
                        }
                    >
                        Approve
                    </Button>
                )}

            {status === Status.VERIFYING_ADMIN &&
                (
                    <Button
                        variant='success'
                        type='button'
                        onClick={handleVerfified}
                        disabled={isLoading || haveFeedback}
                        className={
                            haveFeedback ? "cursor-not-allowed select-none" : ""
                        }
                        title={
                            haveFeedback
                                ? "You can't approve when feedback is not empty"
                                : ""
                        }
                    >
                        Verified
                    </Button>
                )}
            {status === Status.VERIFIED && (
                <Button
                    variant='danger'
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Close
                </Button>
            )}
            {(status === Status.DONE ||
                status === Status.VERIFYING ||
                status === Status.DOCUMENT_DECLINED) && (
                <Button variant='danger'>Close and send feedback</Button>
            )}
        </div>
    );
};
