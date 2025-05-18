import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { courseSchema } from "../../schemas/course-schema.ts";
import { CourseForm } from "./course-form.tsx";
import { Form } from "../ui/form.tsx";
import { Button } from "../ui/button.tsx";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createNewCourse } from "../../service/course.ts";
import { base64ToBlob, blobToFile } from "../../utils/ThumbnailConverter.ts";
import { useState } from "react";

const CreateCourse = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        mode: "onBlur",
        shouldFocusError: false,
        defaultValues: {
            name: "",
            teacherName: "",
            link: "",
            level: "",
            platform: "",
            categories: [],
            thumbnailUrl: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof courseSchema>) => {
        const formData = new FormData();

        setIsSubmitting(true);

        // Append regular values to FormData
        Object.entries(values).forEach(([key, value]) => {
            if (key !== "categories" && key !== "thumbnailUrl") {
                if (typeof value === "string") {
                    formData.append(key, value);
                }
            }
        });

        // Append formatted categories to FormData
        values.categories.forEach((category, index) => {
            formData.append(`categories[${index}].label`, category.label!);
            formData.append(`categories[${index}].value`, category.value);
        });

        // Handle the thumbnailUrl if it starts with "blob:" or "data:"
        if (values.thumbnailUrl.startsWith("blob:")) {
            const thumbnailFile = await blobToFile(
                values.thumbnailUrl,
                values.name
            );
            formData.append("thumbnailFile", thumbnailFile);
        } else if (values.thumbnailUrl.startsWith("data:")) {
            const thumbnailFromBase64 = base64ToBlob(values.thumbnailUrl);
            const thumbnailFile = new File(
                [thumbnailFromBase64],
                `${values.name}.jpg`,
                { type: thumbnailFromBase64.type }
            );
            formData.append("thumbnailFile", thumbnailFile);
        } else {
            formData.append("thumbnailUrl", values.thumbnailUrl);
        }

        let status;
        try {
            status = await createNewCourse(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);

            if (status === 201) {
                toast.success("Create a new course successfully", {
                    description: "",
                    style: {
                        color: "green",
                        fontWeight: "bold",
                        textAlign: "center",
                    },
                });
                navigate("/admin", {
                    replace: true,
                    state: { refresh: true },
                });
            } else if (status === 500) {
                toast.error(
                    "Oops! Something went wrong. Please try again later",
                    {
                        description:
                            "Contact the admin for further assistance!",
                        style: {
                            color: "red",
                            fontWeight: "bold",
                            textAlign: "center",
                        },
                    }
                );
            } else if (status === 409) {
                toast.error("Create a new course unsuccessfully", {
                    description:
                        "Your course already exists in the system. Please check again!",
                    style: {
                        color: "red",
                        fontWeight: "bold",
                        textAlign: "center",
                    },
                });
            } else if (status === 503) {
                toast.error("Create a new course unsuccessfully", {
                    description:
                        "Check your internet connection and try again!",
                    style: {
                        color: "red",
                        fontWeight: "bold",
                        textAlign: "center",
                    },
                });
            } else {
                toast.error(
                    "Oops! Something went wrong. Please try again later",
                    {
                        description:
                            "Contact the admin for further assistance!",
                        style: {
                            color: "red",
                            fontWeight: "bold",
                            textAlign: "center",
                        },
                    }
                );
            }
        }
    };

    return (
        <div className='w-full px-20 py-10 bg-white border-2 border-gray-200 rounded-3xl'>
            <h2 className='text-[32px] text-center mb-5 font-semibold'>
                Create a new course
            </h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <CourseForm form={form} isEdit={true} />
                    <div className='flex justify-end'>
                        <Button
                            variant='success'
                            className='mt-10'
                            type='submit'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default CreateCourse;
