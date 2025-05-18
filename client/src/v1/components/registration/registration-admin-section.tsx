import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";

import { feedbackSchema } from "../../schemas/feedback-schema.ts";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form.tsx";
import { Textarea } from "../ui/textarea.tsx";
import { RegistrationButtonAdmin } from "./button/registration-button-admin.tsx";
import { RootState } from "../../redux/store/store.ts";
import { useRegistrationModal } from "../../hooks/use-registration-modal.ts";
import { handleAvatarUrl } from "../../utils/handleAvatarUrl.ts";
import { useRefreshState } from "../../hooks/use-refresh-state.ts";
import { useRegistrationDetail } from "../../hooks/use-registration-detail.ts";
import {
    closeRegistration,
    declineRegistration,
} from "../../service/registration.ts";

import { Status } from "../../constant";

type Props = {
    status?: Status;
};
const RegistrationAdminSection = ({ status }: Props) => {
    const user = useSelector((state: RootState) => state.user.user);
    const { id, close } = useRegistrationModal((store) => store);
    const { setRegistrationFlagAdmin } = useRefreshState((state) => state);
    const { closeRegistration: clRegistration } = useRegistrationDetail(
        (store) => store
    );
    const closeModal = () => {
        clRegistration();
        setRegistrationFlagAdmin();
    };
    const form = useForm<z.infer<typeof feedbackSchema>>({
        resolver: zodResolver(feedbackSchema),
        mode: "onBlur",
        defaultValues: {
            comment: "",
        },
    });

    async function onSubmit(values: z.infer<typeof feedbackSchema>) {
        if (status === "SUBMITTED") {
            await declineRegistration(id!, values.comment, close);
            closeModal();
        } else if (
            status === "DONE" ||
            status === "VERIFYING" ||
            status === "DOCUMENT_DECLINED"
        ) {
            await closeRegistration(id!, values.comment, close);
            closeModal();
        }
    }

    const avatarUrl = handleAvatarUrl(user.avatarUrl);
    const adminName = user.fullName ? user.fullName : "Anonymous";

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='w-full mt-10 space-y-8'
            >
                {(status === Status.SUBMITTED ||
                    status === Status.DONE ||
                    status === Status.VERIFYING ||
                    status === Status.DOCUMENT_DECLINED) && (
                    <FormField
                        control={form.control}
                        name='comment'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='flex items-center'>
                                    <img
                                        src={avatarUrl}
                                        alt='avatar'
                                        className='rounded-full mr-2 w-[40px] h-[40px] border-2 border-violet-500 mb-1'
                                    />
                                    {adminName}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='Write your feedback here!!!'
                                        className='resize-none'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <RegistrationButtonAdmin
                    haveFeedback={form.getValues("comment").length > 0}
                    status={status}
                />
            </form>
        </Form>
    );
};

export default RegistrationAdminSection;
